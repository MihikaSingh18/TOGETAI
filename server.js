const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { Resend } = require('resend');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Submit feedback endpoint
app.post('/api/submit-feedback', async (req, res) => {
  try {
    const {
      role,
      name,
      email,
      instagram,
      last_campaign,
      platform_help,
      why_join
    } = req.body;

    // ✅ Validate required fields first
    if (!role || !name || !email || !instagram || !last_campaign || !why_join) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }

    // ✅ Try inserting into Supabase (unique email enforced in DB)
    const { data, error } = await supabase
      .from('feedback')
      .insert([
        {
          role,
          name,
          email,
          instagram,
          last_campaign,
          platform_help: platform_help || null,
          why_join,
          created_at: new Date().toISOString()
        }
      ])
      .select();

    // Handle DB error
    if (error) {
      if (error.code === '23505') {
        // duplicate email
        return res.status(400).json({
          success: false,
          message: "⚠️ You have already submitted feedback with this email."
        });
      }

      console.error('❌ Supabase error:', error);
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: error.message
      });
    }

    console.log('✅ Data saved to Supabase:', data);

    // ✅ Send thank you email
    // Replace the email sending section in your code with this:

try {
  const emailResult = await resend.emails.send({
    from: 'Togetai <no-reply@togetai.com>',
    to: [email],
    subject: 'Welcome to Togetai - You are now a part of Togetai! 🚀',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 28px; font-weight: bold;">Welcome to Togetai! 🚀</h1>
          <p style="color: #e0e6ed; margin: 10px 0 0 0; font-size: 16px;">You're now part of something amazing!</p>
        </div>
        
        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <h2 style="color: #333; margin-top: 0;">Hi ${name}! 👋</h2>
          
          <p style="color: #555; line-height: 1.6; font-size: 16px;">
            Thanks for joining - we're excited to have you on board! 🎉 Your submission has been successfully received, and you're now one of the first to experience what we're building at Togetai.
          </p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #667eea; margin-top: 0; font-size: 18px;">What's next:</h3>
            <ul style="color: #555; line-height: 1.8; padding-left: 20px;">
              <li>✅ You're on our exclusive early access list</li>
              <li>📧 We'll send you platform updates and launch notifications</li>
              <li>🎯 You'll get priority access when we launch</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border-radius: 25px; font-weight: bold; text-decoration: none;">
              🚀 Get Ready for Launch!
            </div>
          </div>
          
          <hr style="border: none; height: 1px; background: #e9ecef; margin: 30px 0;">
          
          <p style="color: #666; text-align: center; font-size: 14px; margin: 0;">
            Best regards,<br>
            <strong style="color: #667eea;">Team Togetai</strong>
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 20px; padding: 20px;">
          <p style="color: #888; font-size: 12px; margin: 0;">
            © 2025 Togetai. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
Hi ${name}!

Thanks for joining - we're excited to have you on board! 🎉 
Your submission has been successfully received, and you're now one of the first to experience what we're building at Togetai.

What's next:
- You're on our exclusive early access list
- We'll send you platform updates and launch notifications  
- You'll get priority access when we launch

Best regards,
Team Togetai

© 2025 Togetai. All rights reserved.
    `
  });

  console.log('✅ Thank you email sent:', emailResult);
} catch (emailError) {
  console.error('⚠️ Email sending failed:', emailError);
  // Don't fail the request if email fails
}

    // ✅ Final success response
    res.status(200).json({
      success: true,
      message: 'Feedback submitted successfully!',
      data: data[0]
    });

  } catch (error) {
    console.error('❌ Server error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    message: 'Togetai Backend Server is running!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Togetai Backend Server running on port ${PORT}`);
  console.log(`📱 Frontend available at: http://localhost:${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`📧 Email service: ${process.env.RESEND_API_KEY ? '✅ Configured' : '❌ Not configured'}`);
  console.log(`💾 Database: ${process.env.SUPABASE_URL ? '✅ Connected' : '❌ Not configured'}`);
});

module.exports = app;