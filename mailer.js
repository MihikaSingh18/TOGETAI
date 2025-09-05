// mailer.js - Using Resend API as primary, Nodemailer as fallback
import nodemailer from "nodemailer";
import dotenv from 'dotenv';

dotenv.config();

// Resend API function
async function sendWithResend({ to, subject, text, html }) {
  try {
    console.log('Attempting to send email via Resend API...');
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Togetai <connect@togetai.com>',
        to: [to],
        subject: subject,
        html: html || `<p>${text}</p>`,
        text: text
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Resend API error: ${response.status} - ${error}`);
    }

    const result = await response.json();
    console.log('✅ Email sent via Resend successfully:', result.id);
    return result;
  } catch (error) {
    console.error('❌ Resend email failed:', error);
    throw error;
  }
}

// Main sendMail function - using Resend only (simpler and more reliable)
export const sendMail = async ({ to, subject, text, html }) => {
  return await sendWithResend({ to, subject, text, html });
};

// Test email connection
export const testEmailConnection = async () => {
  try {
    console.log('Testing Resend API connection...');
    console.log('API Key:', process.env.RESEND_API_KEY ? 'Set ✅' : 'Not Set ❌');
    
    // Simple test - try to send to a test email that will validate the API key
    const testResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Togetai <connect@togetai.com>',
        to: ['delivered@resend.dev'], // Resend's test email
        subject: 'Connection Test',
        text: 'Testing Resend connection'
      }),
    });
    
    if (response.ok) {
      console.log('✅ Resend API connection successful');
      return true;
    } else {
      const errorText = await testResponse.text();
      console.log('⚠️ Resend API response:', testResponse.status, errorText);
      return false;
    }
  } catch (error) {
    console.error('❌ Resend connection test failed:', error);
    return false;
  }
};

// Send welcome email with HTML
export const sendWelcomeEmail = async (email, name) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #00D4AA; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        a { color: #00D4AA; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to Togetai! 🚀</h1>
        </div>
        <div class="content">
          <h2>Hi ${name}!</h2>
          <p>Thank you for your submission! We've received your information and our team will review it shortly.</p>
          <p>We're excited about the possibility of working together and will get back to you soon with next steps.</p>
          <div class="footer">
            <p>Best regards,<br><strong>The Togetai Team</strong></p>
            <p><a href="https://togetai.com">Visit our website</a></p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const textContent = `Hi ${name}!\n\nThank you for your submission! We've received your information and our team will review it shortly.\n\nWe're excited about the possibility of working together and will get back to you soon with next steps.\n\nBest regards,\nThe Togetai Team\n\nVisit our website: https://togetai.com`;
  
  return await sendMail({
    to: email,
    subject: 'Welcome to Togetai - Thank you for your submission!',
    text: textContent,
    html: htmlContent
  });
};