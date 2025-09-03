const nodemailer = require('nodemailer');

// Create transporter using Gmail SMTP
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com', // Replace with your Gmail
    pass: process.env.EMAIL_PASS || 'your-app-password' // Replace with your app password
  }
});

// Email template for password reset
const createPasswordResetEmail = (resetLink, username) => {
  return {
    subject: 'Password Reset Request - Let\'s Create',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
        <div style="background-color: #ffffff; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">🔐 Password Reset</h1>
            <p style="color: #7f8c8d; margin: 10px 0 0 0;">Let's Create - Art Community</p>
          </div>
          
          <div style="margin-bottom: 25px;">
            <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 0;">
              Hello ${username || 'there'},
            </p>
            <p style="color: #2c3e50; font-size: 16px; line-height: 1.6; margin: 15px 0;">
              We received a request to reset your password for your Let's Create account. 
              If you didn't make this request, you can safely ignore this email.
            </p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" 
               style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                      color: white; 
                      padding: 15px 30px; 
                      text-decoration: none; 
                      border-radius: 25px; 
                      font-weight: bold; 
                      font-size: 16px; 
                      display: inline-block; 
                      box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
              Reset Your Password
            </a>
          </div>
          
          <div style="margin-top: 30px; padding: 20px; background-color: #f8f9fa; border-radius: 8px;">
            <p style="color: #7f8c8d; font-size: 14px; margin: 0 0 10px 0; font-weight: bold;">
              🔒 Security Notice:
            </p>
            <ul style="color: #7f8c8d; font-size: 14px; margin: 0; padding-left: 20px;">
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>For security, this link can only be used once</li>
            </ul>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; text-align: center;">
            <p style="color: #95a5a6; font-size: 12px; margin: 0;">
              If the button doesn't work, copy and paste this link into your browser:
            </p>
            <p style="color: #3498db; font-size: 12px; margin: 5px 0 0 0; word-break: break-all;">
              ${resetLink}
            </p>
          </div>
        </div>
        
        <div style="text-align: center; margin-top: 20px;">
          <p style="color: #95a5a6; font-size: 12px; margin: 0;">
            © 2024 Let's Create. All rights reserved.
          </p>
        </div>
      </div>
    `,
    text: `
Password Reset Request - Let's Create

Hello ${username || 'there'},

We received a request to reset your password for your Let's Create account. 
If you didn't make this request, you can safely ignore this email.

To reset your password, click the link below:
${resetLink}

This link will expire in 1 hour.

Security Notice:
- This link will expire in 1 hour
- If you didn't request this reset, please ignore this email
- For security, this link can only be used once

© 2024 Let's Create. All rights reserved.
    `
  };
};

// Function to send password reset email
const sendPasswordResetEmail = async (email, resetLink, username) => {
  try {
    const emailContent = createPasswordResetEmail(resetLink, username);
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'your-email@gmail.com',
      to: email,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendPasswordResetEmail,
  transporter
};
