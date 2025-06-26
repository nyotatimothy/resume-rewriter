import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { openai } from "@/lib/openai";
import { prisma } from "@/lib/prisma";
import { rateLimit } from "@/lib/rateLimit";
import { getUserFromRequest } from "@/lib/session";
import { env } from "@/lib/env";
import { locale } from "@/lib/localization";
import { RewriteRequest, RewriteResponse } from "@/types/rewrite";

const RewriteSchema = z.object({
  resume: z.string().max(3000),
  jobDescription: z.string().max(3000),
  template: z.string().max(3000),
  userEmail: z.string().email().optional(),
});

async function checkQuota(email: string | null, ip: string): Promise<boolean> {
  // Special testing account - unlimited rewrites
  if (email === "nyotatimothy@gmail.com") {
    console.log('🧪 Testing account detected - unlimited quota granted');
    return true;
  }

  // Free: 1 rewrite/day, Pro: unlimited
  if (!email) {
    // Anonymous: 1/day per IP
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const count = await prisma.submission.count({
      where: {
        email: null,
        createdAt: { gte: since },
        template: "anonymous",
        id: { contains: ip },
      },
    });
    return count < 1;
  }
  // Check user
  const user = await prisma.user.findUnique({ where: { email } });
  if (user?.isPro) return true;
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const count = await prisma.submission.count({
    where: { email, createdAt: { gte: since } },
  });
  return count < 1;
}

export async function POST(req: NextRequest) {
  try {
    console.log('🔍 Resume rewrite request started');
    
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    // Rate limit: 10/min per IP
    const { limited } = rateLimit(req, { windowMs: 60_000, max: 10, keyPrefix: "rewrite" });
    if (limited) {
      return NextResponse.json({ error: locale.error_too_many_requests }, { status: 429 });
    }

    const body = await req.json();
    const parse = RewriteSchema.safeParse(body);
    if (!parse.success) {
      console.log('❌ Invalid input:', parse.error);
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }
    const { resume, jobDescription, template, userEmail } = parse.data;

    console.log('📝 Processing resume rewrite for template:', template);

    // Determine user (from session or email)
    let email: string | null = null;
    const user = getUserFromRequest(req);
    if (user) email = user.email;
    else if (userEmail) email = userEmail;

    console.log('👤 User email:', email || 'anonymous');

    // Enforce quota
    const allowed = await checkQuota(email, ip);
    if (!allowed) {
      console.log('❌ Quota exceeded for user:', email);
      return NextResponse.json({ error: locale.error_quota_exceeded }, { status: 401 });
    }

    console.log('✅ Quota check passed, calling OpenAI...');

    // Call GPT-3.5-turbo
    let gptResponse: RewriteResponse;
    try {
      const systemPrompt = `You are Resume Rewriter, an expert at tailoring resumes to job descriptions. 

Your task is to rewrite the provided resume to better match the job description while maintaining honesty and accuracy. Do not fabricate or exaggerate experiences.

Template styles and their formatting:

**CLASSIC TEMPLATE:**
- Professional, traditional format
- Clear section headers with underlines or bold text
- Bullet points for achievements
- Clean, readable layout
- Standard sections: Summary, Experience, Education, Skills

**MODERN TEMPLATE:**
- Contemporary, visually appealing design
- Use of bold headers and subtle formatting
- Achievement-focused bullet points
- Professional yet creative layout
- May include additional sections like Projects, Certifications

**MINIMAL TEMPLATE:**
- Simple, clean, content-focused
- Minimal formatting, maximum readability
- Straightforward bullet points
- Focus on achievements and skills
- Streamlined sections

CRITICAL: You must respond with valid JSON only. Do not include any text before or after the JSON object.

Output format: Return ONLY a JSON object with this exact structure:
{
  "sections": {
    "summary": "Professional summary...",
    "experience": "Work experience...",
    "education": "Education...",
    "skills": "Skills..."
  },
  "markdown": "Complete formatted resume in markdown"
}

IMPORTANT FORMATTING RULES:
1. Use # for main headers (e.g., # John Doe)
2. Use ## for section headers (e.g., ## Professional Summary)
3. Use ### for subsection headers (e.g., ### Work Experience)
4. Use bullet points (- or •) for achievements and skills
5. Use **bold** for company names, job titles, and key skills
6. Use *italic* for dates and locations
7. Add horizontal lines (---) between major sections
8. Keep lines under 80 characters for readability
9. Use consistent formatting throughout
10. DO NOT include markdown characters in the final text - they should be formatting only
11. Avoid using quotes, backslashes, or special characters that could break JSON parsing
12. If you need to include quotes in text, use single quotes instead of double quotes

Example formatting:
# John Doe
Software Engineer | john.doe@email.com | (555) 123-4567

---

## Professional Summary
Experienced software engineer with expertise in...

---

## Work Experience
### **Software Engineer** | *Tech Corp* | *2020-2023*
- Developed web applications using **React** and **Node.js**
- Collaborated with cross-functional teams to deliver...

---

## Education
### **Bachelor of Science in Computer Science** | *University of Technology* | *2020*

---

## Skills
**Technical:** JavaScript, React, Node.js, Python, SQL, Git
**Soft Skills:** Problem-solving, Team collaboration, Agile methodologies`;

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: `Resume:\n${resume}\n\nJob Description:\n${jobDescription}\n\nTemplate Style: ${template}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1500,
      });

      console.log('🤖 OpenAI response received');

      // Expecting a JSON response with sections and markdown
      const content = completion.choices[0].message.content || "{}";
      
      try {
        // First, try to clean and parse the JSON
        let cleanedContent = content.trim();
        
        // Remove any markdown code blocks if present
        cleanedContent = cleanedContent.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
        
        // Try to parse the JSON
        gptResponse = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.log('❌ JSON parse error:', parseError);
        console.log('❌ Raw content:', content);
        
        // Fallback: try to extract markdown from the response
        try {
          // Look for markdown content between triple backticks
          const markdownMatch = content.match(/```(?:markdown)?\n?([\s\S]*?)\n?```/);
          
          if (markdownMatch && markdownMatch[1]) {
            // Create a fallback response structure with extracted markdown
            gptResponse = {
              sections: {
                summary: "Professional summary extracted from response",
                experience: "Work experience extracted from response", 
                education: "Education extracted from response",
                skills: "Skills extracted from response"
              },
              markdown: markdownMatch[1].trim()
            };
            console.log('✅ Using extracted markdown from code blocks');
          } else {
            // Use the entire content as markdown
            gptResponse = {
              sections: {
                summary: "Professional summary extracted from response",
                experience: "Work experience extracted from response", 
                education: "Education extracted from response",
                skills: "Skills extracted from response"
              },
              markdown: content.trim()
            };
            console.log('✅ Using entire content as markdown');
          }
        } catch (fallbackError) {
          console.log('❌ Fallback also failed:', fallbackError);
          
          // Last resort: create a minimal response
          gptResponse = {
            sections: {
              summary: "Professional summary",
              experience: "Work experience", 
              education: "Education",
              skills: "Skills"
            },
            markdown: "# Resume\n\nContent is being processed. Please try again if this appears incomplete."
          };
          
          console.log('✅ Using minimal fallback response');
        }
      }
      
      if (!gptResponse.sections || !gptResponse.markdown) {
        console.log('❌ Malformed GPT response:', content);
        throw new Error("Malformed GPT response");
      }
      
      console.log('✅ GPT response parsed successfully');
    } catch (err) {
      console.error('❌ OpenAI error:', err);
      return NextResponse.json({ error: locale.error_internal }, { status: 500 });
    }

    // Log submission
    try {
      await prisma.submission.create({
        data: {
          email: email || null,
          input: { resume, jobDescription, template },
          output: gptResponse,
          template: email ? "user" : "anonymous",
          // For anonymous, store IP in id for quota tracking
          id: email ? undefined : `${Date.now()}_${ip}`,
        },
      });
      console.log('✅ Submission logged to database');
    } catch (err) {
      console.error('⚠️ Failed to log submission:', err);
      // Logging failure should not block response
    }

    console.log('🎉 Resume rewrite completed successfully');
    return NextResponse.json(gptResponse);
    
  } catch (error) {
    console.error('❌ Unexpected error in resume rewrite:', error);
    return NextResponse.json({ error: locale.error_internal }, { status: 500 });
  }
} 