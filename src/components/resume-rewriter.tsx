"use client"

import Link from "next/link"
import { useState } from "react"
import { FileText, Download, Copy, RefreshCw, Loader2, AlertCircle, CheckCircle } from "lucide-react"
import toast from "react-hot-toast"
import { useAuth } from "./auth-provider"

const templates = [
  { 
    id: "classic", 
    name: "Classic", 
    description: "Traditional format with clean lines",
    preview: "Professional and timeless design",
    features: "Serif fonts, underlines, traditional layout"
  },
  { 
    id: "modern", 
    name: "Modern", 
    description: "Contemporary design with visual elements",
    preview: "Clean and visually appealing",
    features: "Sans-serif fonts, gradients, card layout"
  },
  { 
    id: "minimal", 
    name: "Minimal", 
    description: "Simple and clean layout",
    preview: "Focus on content over styling",
    features: "Monospace fonts, clean spacing, minimal design"
  },
]

interface RewriteResult {
  sections: Record<string, string>
  markdown: string
}

export function ResumeRewriter() {
  const [resume, setResume] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [selectedTemplate, setSelectedTemplate] = useState("classic")
  const [result, setResult] = useState<RewriteResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const handleRewrite = async () => {
    if (!resume.trim() || !jobDescription.trim()) {
      toast.error("Please fill in both resume and job description")
      return
    }

    if (resume.length > 3000 || jobDescription.length > 3000) {
      toast.error("Text must be under 3000 characters")
      return
    }

    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch("/api/rewrite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resume,
          jobDescription,
          template: selectedTemplate,
          userEmail: user?.email,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
        setError(null)
        toast.success("Resume rewritten successfully!")
      } else {
        const errorMessage = data.error || "Failed to rewrite resume"
        setError(errorMessage)
        toast.error(errorMessage)
        
        // Handle specific errors
        if (errorMessage.includes("quota")) {
          toast.error("You've reached your daily limit. Upgrade to Pro for unlimited rewrites!")
        } else if (errorMessage.includes("API")) {
          toast.error("Service temporarily unavailable. Please try again later.")
        }
      }
    } catch (error) {
      const errorMessage = "Network error. Please check your connection and try again."
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    if (!result) return

    try {
      await navigator.clipboard.writeText(result.markdown)
      toast.success("Copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy to clipboard")
    }
  }

  const renderMarkdown = (markdown: string) => {
    return markdown
      // Headers
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-gray-900 mb-3">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-gray-800 mt-6 mb-3 border-b border-gray-200 pb-1">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-medium text-gray-700 mt-4 mb-2">$1</h3>')
      // Horizontal lines
      .replace(/^---$/gim, '<hr class="border-gray-300 my-6">')
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-600">$1</em>')
      // Bullet points
      .replace(/^- (.*$)/gim, '<li class="mb-2 leading-relaxed">$1</li>')
      .replace(/^• (.*$)/gim, '<li class="mb-2 leading-relaxed">$1</li>')
      // Wrap lists
      .replace(/(<li.*<\/li>)/g, '<ul class="list-disc list-inside space-y-1 mb-4">$1</ul>')
      // Line breaks
      .replace(/\n/g, '<br>')
      // Clean up multiple line breaks and spaces
      .replace(/<br><br><br>/g, '<br><br>')
      .replace(/<br><br><br>/g, '<br><br>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const renderPreviewMarkdown = (markdown: string) => {
    return markdown
      // Headers with smaller fonts and tighter spacing
      .replace(/^# (.*$)/gim, '<h1 class="text-lg font-bold text-gray-900 mb-1" style="font-size: 1.125rem;">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="text-base font-semibold text-gray-800 mt-3 mb-1" style="font-size: 1rem;">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="text-sm font-medium text-gray-700 mt-2 mb-1" style="font-size: 0.875rem;">$1</h3>')
      // Horizontal lines with less spacing
      .replace(/^---$/gim, '<hr class="border-gray-300 my-2" style="margin: 0.5rem 0;">')
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-600">$1</em>')
      // Bullet points with minimal spacing
      .replace(/^- (.*$)/gim, '<li class="mb-0.5" style="margin-bottom: 0.125rem;">$1</li>')
      .replace(/^• (.*$)/gim, '<li class="mb-0.5" style="margin-bottom: 0.125rem;">$1</li>')
      // Wrap lists with tight spacing
      .replace(/(<li.*<\/li>)/g, '<ul class="list-disc list-inside space-y-0.5 mb-2" style="margin-bottom: 0.5rem;">$1</ul>')
      // Line breaks
      .replace(/\n/g, '<br>')
      // Clean up multiple line breaks and spaces
      .replace(/<br><br><br>/g, '<br><br>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const handleDownloadPDF = () => {
    if (!result) return

    // Function to convert markdown to HTML for download
    const markdownToHtml = (markdown: string) => {
      return markdown
        // Headers
        .replace(/^# (.*$)/gim, '<h1>$1</h1>')
        .replace(/^## (.*$)/gim, '<h2>$1</h2>')
        .replace(/^### (.*$)/gim, '<h3>$1</h3>')
        // Horizontal lines
        .replace(/^---$/gim, '<hr>')
        // Bold text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        // Italic text
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        // Bullet points
        .replace(/^- (.*$)/gim, '<li>$1</li>')
        .replace(/^• (.*$)/gim, '<li>$1</li>')
        // Wrap lists (simplified approach)
        .replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>')
        // Line breaks
        .replace(/\n/g, '<br>')
        // Clean up multiple line breaks
        .replace(/<br><br>/g, '<br><br>');
    };

    // Template-specific CSS styles
    const getTemplateStyles = () => {
      switch (selectedTemplate) {
        case 'classic':
          return `
            body { 
              font-family: Georgia, serif; 
              line-height: 1.6; 
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
              color: #333;
            }
            h1 { 
              font-size: 2.5em; 
              margin-bottom: 10px; 
              color: #2c3e50;
              border-bottom: 2px solid #3498db;
              padding-bottom: 10px;
            }
            h2 { 
              font-size: 1.5em; 
              margin-top: 30px; 
              margin-bottom: 15px; 
              color: #2c3e50;
              border-bottom: 1px solid #bdc3c7;
              padding-bottom: 5px;
            }
            h3 { 
              font-size: 1.2em; 
              margin-top: 20px; 
              margin-bottom: 10px; 
              color: #34495e;
            }
            hr {
              border: none;
              border-top: 1px solid #bdc3c7;
              margin: 30px 0;
              opacity: 0.6;
            }
            ul { margin: 10px 0; }
            li { margin: 8px 0; line-height: 1.5; }
            .contact-info { 
              text-align: center; 
              margin-bottom: 30px; 
              font-size: 1.1em;
              color: #7f8c8d;
            }
          `;
        case 'modern':
          return `
            body { 
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
              line-height: 1.7; 
              max-width: 850px;
              margin: 0 auto;
              padding: 50px;
              color: #2d3748;
              background: #fafafa;
            }
            .resume-container {
              background: white;
              padding: 40px;
              border-radius: 12px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            h1 { 
              font-size: 2.8em; 
              margin-bottom: 15px; 
              color: #1a202c;
              font-weight: 700;
            }
            h2 { 
              font-size: 1.6em; 
              margin-top: 35px; 
              margin-bottom: 20px; 
              color: #2d3748;
              font-weight: 600;
              position: relative;
            }
            h2::after {
              content: '';
              position: absolute;
              bottom: -5px;
              left: 0;
              width: 50px;
              height: 3px;
              background: linear-gradient(90deg, #667eea, #764ba2);
              border-radius: 2px;
            }
            h3 { 
              font-size: 1.3em; 
              margin-top: 25px; 
              margin-bottom: 12px; 
              color: #4a5568;
              font-weight: 600;
            }
            hr {
              border: none;
              border-top: 2px solid #e2e8f0;
              margin: 40px 0;
              opacity: 0.8;
            }
            ul { margin: 15px 0; }
            li { margin: 10px 0; line-height: 1.6; }
            .contact-info { 
              text-align: center; 
              margin-bottom: 35px; 
              font-size: 1.2em;
              color: #718096;
              font-weight: 500;
            }
            strong { color: #2d3748; }
            em { color: #718096; }
          `;
        case 'minimal':
          return `
            body { 
              font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace; 
              line-height: 1.5; 
              max-width: 700px;
              margin: 0 auto;
              padding: 30px;
              color: #2d3748;
              background: white;
            }
            h1 { 
              font-size: 2.2em; 
              margin-bottom: 8px; 
              color: #1a202c;
              font-weight: 600;
            }
            h2 { 
              font-size: 1.4em; 
              margin-top: 25px; 
              margin-bottom: 12px; 
              color: #2d3748;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            h3 { 
              font-size: 1.1em; 
              margin-top: 18px; 
              margin-bottom: 8px; 
              color: #4a5568;
              font-weight: 600;
            }
            hr {
              border: none;
              border-top: 1px solid #e2e8f0;
              margin: 25px 0;
              opacity: 0.5;
            }
            ul { margin: 8px 0; }
            li { margin: 6px 0; line-height: 1.4; }
            .contact-info { 
              text-align: left; 
              margin-bottom: 25px; 
              font-size: 1em;
              color: #718096;
            }
            strong { color: #2d3748; }
            em { color: #718096; }
          `;
        default:
          return `
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              max-width: 800px;
              margin: 0 auto;
              padding: 40px;
            }
            h1, h2, h3 { color: #333; }
            hr {
              border: none;
              border-top: 1px solid #ccc;
              margin: 20px 0;
            }
            .section { margin-bottom: 20px; }
            ul { margin: 10px 0; }
            li { margin: 5px 0; }
          `;
      }
    };

    // Create a properly formatted HTML document
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Resume - ${selectedTemplate.charAt(0).toUpperCase() + selectedTemplate.slice(1)} Template</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            ${getTemplateStyles()}
            @media print {
              body { 
                background: white !important; 
                padding: 20px !important;
              }
              .resume-container {
                box-shadow: none !important;
                padding: 20px !important;
              }
            }
          </style>
        </head>
        <body>
          ${selectedTemplate === 'modern' ? '<div class="resume-container">' : ''}
          ${markdownToHtml(result.markdown)}
          ${selectedTemplate === 'modern' ? '</div>' : ''}
        </body>
      </html>
    `;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${selectedTemplate}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success(`Resume downloaded as ${selectedTemplate} template!`);
  }

  const handleSwitchTemplate = (templateId: string) => {
    setSelectedTemplate(templateId)
    if (result) {
      // Re-run the rewrite with new template
      handleRewrite()
    }
  }

  const getCharacterCount = (text: string) => {
    const count = text.length;
    const max = 3000;
    const percentage = (count / max) * 100;
    return { count, max, percentage };
  }

  // Generate Lorem Ipsum preview based on selected template
  const getPreviewContent = () => {
    const baseContent = {
      classic: `# John Doe
Software Engineer | john.doe@email.com | (555) 123-4567

---

## Professional Summary
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

---

## Work Experience
### **Some Role** | *Some Company* | *2020-2023*
- Lorem ipsum dolor sit amet, consectetur adipiscing elit
- Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
- Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris

### **Another Role** | *Another Company* | *2018-2020*
- Lorem ipsum dolor sit amet, consectetur adipiscing elit
- Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
- Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris

---

## Education
### **Bachelor of Science in Computer Science** | *University of Technology* | *2018*

---

## Skills
**Technical:** JavaScript, React, Node.js, Python, SQL, Git, Docker, AWS
**Soft Skills:** Problem-solving, Team collaboration, Agile methodologies, Leadership`,

      modern: `# John Doe
Software Engineer | john.doe@email.com | (555) 123-4567

---

## Professional Summary
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

---

## Work Experience
### **Some Role** | *Some Company* | *2020-2023*
- Lorem ipsum dolor sit amet, consectetur adipiscing elit
- Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
- Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris

### **Another Role** | *Another Company* | *2018-2020*
- Lorem ipsum dolor sit amet, consectetur adipiscing elit
- Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
- Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris

---

## Projects
### **Project Name** | *2022*
- Lorem ipsum dolor sit amet, consectetur adipiscing elit
- Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua

---

## Education
### **Bachelor of Science in Computer Science** | *University of Technology* | *2018*

---

## Skills
**Technical:** JavaScript, React, Node.js, Python, SQL, Git, Docker, AWS
**Soft Skills:** Problem-solving, Team collaboration, Agile methodologies, Leadership`,

      minimal: `# John Doe
Software Engineer | john.doe@email.com | (555) 123-4567

---

## Professional Summary
Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.

---

## Work Experience
### **Some Role** | *Some Company* | *2020-2023*
- Lorem ipsum dolor sit amet, consectetur adipiscing elit
- Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua
- Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris

### **Another Role** | *Another Company* | *2018-2020*
- Lorem ipsum dolor sit amet, consectetur adipiscing elit
- Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua

---

## Education
### **Bachelor of Science in Computer Science** | *University of Technology* | *2018*

---

## Skills
**Technical:** JavaScript, React, Node.js, Python, SQL, Git
**Soft Skills:** Problem-solving, Team collaboration, Agile methodologies`
    };

    return baseContent[selectedTemplate as keyof typeof baseContent] || baseContent.classic;
  }

  // SVG Preview Components
  const ClassicTemplateSVG = () => (
    <svg width="100%" height="400" viewBox="0 0 300 400" className="w-full h-auto">
      <rect width="300" height="400" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1"/>
      
      {/* Header */}
      <rect x="20" y="20" width="260" height="35" fill="#f3f4f6"/>
      <text x="25" y="32" fontSize="11" fontWeight="bold" fill="#1f2937">JOHN DOE</text>
      <text x="25" y="44" fontSize="7" fill="#6b7280">Software Engineer | john.doe@email.com | (555) 123-4567</text>
      
      {/* Horizontal Line */}
      <line x1="20" y1="65" x2="280" y2="65" stroke="#d1d5db" strokeWidth="1"/>
      
      {/* Professional Summary */}
      <text x="20" y="80" fontSize="9" fontWeight="bold" fill="#374151">PROFESSIONAL SUMMARY</text>
      <line x1="20" y1="84" x2="280" y2="84" stroke="#d1d5db" strokeWidth="1"/>
      <rect x="20" y="88" width="260" height="20" fill="#f9fafb"/>
      <text x="25" y="100" fontSize="6" fill="#6b7280">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</text>
      
      {/* Work Experience */}
      <text x="20" y="120" fontSize="9" fontWeight="bold" fill="#374151">WORK EXPERIENCE</text>
      <line x1="20" y1="124" x2="280" y2="124" stroke="#d1d5db" strokeWidth="1"/>
      
      <text x="20" y="138" fontSize="8" fontWeight="bold" fill="#1f2937">Some Role</text>
      <text x="20" y="146" fontSize="6" fill="#6b7280">Some Company | 2020-2023</text>
      <circle cx="22" cy="154" r="1" fill="#6b7280"/>
      <text x="26" y="157" fontSize="5" fill="#6b7280">Lorem ipsum dolor sit amet</text>
      <circle cx="22" cy="162" r="1" fill="#6b7280"/>
      <text x="26" y="165" fontSize="5" fill="#6b7280">Consectetur adipiscing elit</text>
      <circle cx="22" cy="170" r="1" fill="#6b7280"/>
      <text x="26" y="173" fontSize="5" fill="#6b7280">Sed do eiusmod tempor incididunt</text>
      
      <text x="20" y="185" fontSize="8" fontWeight="bold" fill="#1f2937">Another Role</text>
      <text x="20" y="193" fontSize="6" fill="#6b7280">Another Company | 2018-2020</text>
      <circle cx="22" cy="201" r="1" fill="#6b7280"/>
      <text x="26" y="204" fontSize="5" fill="#6b7280">Lorem ipsum dolor sit amet</text>
      <circle cx="22" cy="209" r="1" fill="#6b7280"/>
      <text x="26" y="212" fontSize="5" fill="#6b7280">Consectetur adipiscing elit</text>
      
      {/* Education */}
      <text x="20" y="230" fontSize="9" fontWeight="bold" fill="#374151">EDUCATION</text>
      <line x1="20" y1="234" x2="280" y2="234" stroke="#d1d5db" strokeWidth="1"/>
      <text x="20" y="248" fontSize="8" fontWeight="bold" fill="#1f2937">Bachelor of Science in Computer Science</text>
      <text x="20" y="256" fontSize="6" fill="#6b7280">University of Technology | 2018</text>
      
      {/* Skills */}
      <text x="20" y="275" fontSize="9" fontWeight="bold" fill="#374151">SKILLS</text>
      <line x1="20" y1="279" x2="280" y2="279" stroke="#d1d5db" strokeWidth="1"/>
      <text x="20" y="293" fontSize="6" fill="#6b7280">Technical: JavaScript, React, Node.js, Python, SQL, Git</text>
      <text x="20" y="301" fontSize="6" fill="#6b7280">Soft Skills: Problem-solving, Team collaboration, Agile</text>
    </svg>
  );

  const ModernTemplateSVG = () => (
    <svg width="100%" height="400" viewBox="0 0 300 400" className="w-full h-auto">
      <rect width="300" height="400" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1"/>
      
      {/* Header - more subtle styling */}
      <rect x="20" y="20" width="260" height="40" fill="#f8fafc"/>
      <text x="25" y="35" fontSize="12" fontWeight="bold" fill="#1f2937">JOHN DOE</text>
      <text x="25" y="47" fontSize="8" fill="#6b7280">Software Engineer | john.doe@email.com | (555) 123-4567</text>
      
      {/* Professional Summary */}
      <text x="20" y="70" fontSize="10" fontWeight="bold" fill="#1f2937">Professional Summary</text>
      <line x1="20" y1="74" x2="70" y2="74" stroke="#3b82f6" strokeWidth="1"/>
      <rect x="20" y="78" width="260" height="25" fill="#f8fafc"/>
      <text x="25" y="90" fontSize="6" fill="#4b5563">Lorem ipsum dolor sit amet, consectetur adipiscing elit...</text>
      
      {/* Work Experience */}
      <text x="20" y="115" fontSize="10" fontWeight="bold" fill="#1f2937">Work Experience</text>
      <line x1="20" y1="119" x2="70" y2="119" stroke="#3b82f6" strokeWidth="1"/>
      
      <text x="20" y="133" fontSize="8" fontWeight="bold" fill="#1f2937">Some Role</text>
      <text x="20" y="141" fontSize="6" fill="#6b7280">Some Company | 2020-2023</text>
      <circle cx="22" cy="149" r="1" fill="#3b82f6"/>
      <text x="26" y="152" fontSize="5" fill="#4b5563">Lorem ipsum dolor sit amet</text>
      <circle cx="22" cy="157" r="1" fill="#3b82f6"/>
      <text x="26" y="160" fontSize="5" fill="#4b5563">Consectetur adipiscing elit</text>
      <circle cx="22" cy="165" r="1" fill="#3b82f6"/>
      <text x="26" y="168" fontSize="5" fill="#4b5563">Sed do eiusmod tempor incididunt</text>
      
      <text x="20" y="180" fontSize="8" fontWeight="bold" fill="#1f2937">Another Role</text>
      <text x="20" y="188" fontSize="6" fill="#6b7280">Another Company | 2018-2020</text>
      <circle cx="22" cy="196" r="1" fill="#3b82f6"/>
      <text x="26" y="199" fontSize="5" fill="#4b5563">Lorem ipsum dolor sit amet</text>
      <circle cx="22" cy="204" r="1" fill="#3b82f6"/>
      <text x="26" y="207" fontSize="5" fill="#4b5563">Consectetur adipiscing elit</text>
      
      {/* Projects */}
      <text x="20" y="225" fontSize="10" fontWeight="bold" fill="#1f2937">Projects</text>
      <line x1="20" y1="229" x2="70" y2="229" stroke="#3b82f6" strokeWidth="1"/>
      <text x="20" y="243" fontSize="8" fontWeight="bold" fill="#1f2937">Project Name</text>
      <text x="20" y="251" fontSize="6" fill="#6b7280">2022</text>
      <circle cx="22" cy="259" r="1" fill="#3b82f6"/>
      <text x="26" y="262" fontSize="5" fill="#4b5563">Lorem ipsum dolor sit amet</text>
      
      {/* Education */}
      <text x="20" y="280" fontSize="10" fontWeight="bold" fill="#1f2937">Education</text>
      <line x1="20" y1="284" x2="70" y2="284" stroke="#3b82f6" strokeWidth="1"/>
      <text x="20" y="298" fontSize="8" fontWeight="bold" fill="#1f2937">Bachelor of Science in Computer Science</text>
      <text x="20" y="306" fontSize="6" fill="#6b7280">University of Technology | 2018</text>
      
      {/* Skills */}
      <text x="20" y="325" fontSize="10" fontWeight="bold" fill="#1f2937">Skills</text>
      <line x1="20" y1="329" x2="70" y2="329" stroke="#3b82f6" strokeWidth="1"/>
      <text x="20" y="343" fontSize="6" fill="#4b5563">Technical: JavaScript, React, Node.js, Python, SQL, Git</text>
      <text x="20" y="351" fontSize="6" fill="#4b5563">Soft Skills: Problem-solving, Team collaboration, Agile</text>
    </svg>
  );

  const MinimalTemplateSVG = () => (
    <svg width="100%" height="400" viewBox="0 0 300 400" className="w-full h-auto">
      <rect width="300" height="400" fill="#ffffff" stroke="#e5e7eb" strokeWidth="1"/>
      
      {/* Header */}
      <text x="20" y="25" fontSize="11" fontWeight="600" fill="#1f2937">JOHN DOE</text>
      <text x="20" y="35" fontSize="7" fill="#6b7280">Software Engineer | john.doe@email.com | (555) 123-4567</text>
      
      {/* Horizontal Line */}
      <line x1="20" y1="45" x2="280" y2="45" stroke="#e5e7eb" strokeWidth="1"/>
      
      {/* Professional Summary */}
      <text x="20" y="60" fontSize="8" fontWeight="600" fill="#374151">PROFESSIONAL SUMMARY</text>
      <rect x="20" y="64" width="260" height="15" fill="#fafafa"/>
      <text x="25" y="74" fontSize="6" fill="#6b7280">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</text>
      
      {/* Work Experience */}
      <text x="20" y="90" fontSize="8" fontWeight="600" fill="#374151">WORK EXPERIENCE</text>
      
      <text x="20" y="103" fontSize="7" fontWeight="600" fill="#1f2937">Some Role</text>
      <text x="20" y="110" fontSize="6" fill="#6b7280">Some Company | 2020-2023</text>
      <text x="22" y="118" fontSize="5" fill="#6b7280">• Lorem ipsum dolor sit amet</text>
      <text x="22" y="124" fontSize="5" fill="#6b7280">• Consectetur adipiscing elit</text>
      <text x="22" y="130" fontSize="5" fill="#6b7280">• Sed do eiusmod tempor incididunt</text>
      
      <text x="20" y="145" fontSize="7" fontWeight="600" fill="#1f2937">Another Role</text>
      <text x="20" y="152" fontSize="6" fill="#6b7280">Another Company | 2018-2020</text>
      <text x="22" y="160" fontSize="5" fill="#6b7280">• Lorem ipsum dolor sit amet</text>
      <text x="22" y="166" fontSize="5" fill="#6b7280">• Consectetur adipiscing elit</text>
      
      {/* Education */}
      <text x="20" y="185" fontSize="8" fontWeight="600" fill="#374151">EDUCATION</text>
      <text x="20" y="198" fontSize="7" fontWeight="600" fill="#1f2937">Bachelor of Science in Computer Science</text>
      <text x="20" y="205" fontSize="6" fill="#6b7280">University of Technology | 2018</text>
      
      {/* Skills */}
      <text x="20" y="225" fontSize="8" fontWeight="600" fill="#374151">SKILLS</text>
      <text x="20" y="238" fontSize="6" fill="#6b7280">Technical: JavaScript, React, Node.js, Python, SQL, Git</text>
      <text x="20" y="245" fontSize="6" fill="#6b7280">Soft Skills: Problem-solving, Team collaboration, Agile</text>
    </svg>
  );

  const getTemplateSVG = () => {
    switch (selectedTemplate) {
      case 'classic':
        return <ClassicTemplateSVG />;
      case 'modern':
        return <ModernTemplateSVG />;
      case 'minimal':
        return <MinimalTemplateSVG />;
      default:
        return <ClassicTemplateSVG />;
    }
  };

  const resumeCount = getCharacterCount(resume);
  const jobCount = getCharacterCount(jobDescription);

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <div>
            <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
              Paste Your Resume *
            </label>
            <textarea
              id="resume"
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your current resume here..."
              className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={3000}
            />
            <div className={`text-right text-sm mt-1 ${
              resumeCount.percentage > 90 ? 'text-red-500' : 
              resumeCount.percentage > 75 ? 'text-yellow-500' : 'text-gray-500'
            }`}>
              {resumeCount.count}/{resumeCount.max}
            </div>
          </div>

          <div>
            <label htmlFor="jobDescription" className="block text-sm font-medium text-gray-700 mb-2">
              Paste Job Description *
            </label>
            <textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description you're applying for..."
              className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              maxLength={3000}
            />
            <div className={`text-right text-sm mt-1 ${
              jobCount.percentage > 90 ? 'text-red-500' : 
              jobCount.percentage > 75 ? 'text-yellow-500' : 'text-gray-500'
            }`}>
              {jobCount.count}/{jobCount.max}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Template Style</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {templates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedTemplate(template.id)}
                  className={`p-4 border rounded-lg text-left transition-colors ${
                    selectedTemplate === template.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <div className="font-medium text-gray-900">{template.name}</div>
                  <div className="text-sm text-gray-600 mt-1">{template.description}</div>
                  <div className="text-xs text-gray-500 mt-2">{template.preview}</div>
                  <div className="text-xs text-blue-600 mt-1 font-medium">{template.features}</div>
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2 mt-0.5" />
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          )}

          <button
            onClick={handleRewrite}
            disabled={isLoading || !resume.trim() || !jobDescription.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Rewriting Resume...
              </>
            ) : (
              <>
                <RefreshCw className="h-5 w-5 mr-2" />
                Rewrite Resume
              </>
            )}
          </button>

          {user && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <div className="flex">
                <CheckCircle className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
                <div className="text-sm text-green-700">
                  Logged in as {user.email}. Your rewrites will be saved.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Output Section */}
        <div className="space-y-6">
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {result ? 'Your Rewritten Resume' : 'Resume Preview'}
              </h3>
              {result && (
                <button
                  onClick={handleDownloadPDF}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Download PDF
                </button>
              )}
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
              {result ? (
                // Show actual processed resume
                result.markdown ? (
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: renderMarkdown(result.markdown) 
                    }}
                  />
                ) : (
                  <div className="text-gray-500 text-center py-8">
                    <p>Resume content is being processed...</p>
                    <p className="text-sm mt-2">Please try again if the content doesn't appear.</p>
                  </div>
                )
              ) : (
                // Show preview with Lorem Ipsum
                <div>
                  <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 text-blue-500 mr-2" />
                      <span className="text-sm text-blue-700 font-medium">Template Preview</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      This shows the layout and structure of your selected template. Fill in your details and click "Rewrite Resume" to generate your personalized version.
                    </p>
                  </div>
                  <div className="flex justify-center">
                    {getTemplateSVG()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Template Selection */}
          {result && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Switch Template</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {templates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSwitchTemplate(template.id)}
                    disabled={isLoading}
                    className={`p-3 border rounded-lg text-left transition-colors disabled:opacity-50 ${
                      selectedTemplate === template.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="font-medium text-gray-900 text-sm">{template.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{template.description}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Links */}
      <div className="mt-16 pt-8 border-t border-gray-200">
        <div className="flex flex-wrap justify-center space-x-6 text-sm text-gray-600">
          <Link href="/privacy" className="hover:text-gray-900 transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-gray-900 transition-colors">
            Terms of Service
          </Link>
          <a
            href="mailto:support@resumerewriter.com?subject=Delete My Data"
            className="hover:text-gray-900 transition-colors"
          >
            Delete My Data
          </a>
        </div>
      </div>
    </div>
  )
}
