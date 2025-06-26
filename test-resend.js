require('dotenv').config({ path: '.env' });
const { Resend } = require('resend');

async function testResend() {
  console.log('🧪 Testing Resend API...\n');
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  
  try {
    console.log('📧 Sending test email...');
    const result = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: 'timnyota@gmail.com',
      subject: 'Test Email from Resume Rewriter',
      html: '<p>This is a test email to verify Resend is working.</p>',
    });
    
    console.log('✅ Email sent successfully!');
    console.log('📋 Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('❌ Email sending failed:');
    console.error('Error:', error.message);
    console.error('Details:', error);
  }
}

testResend(); 