import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

async function sendEmail({ to, subject, html }: EmailOptions) {
  try {
    await transporter.sendMail({
      from: `"SentinelPH" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email send error:', error);
    throw error;
  }
}

export async function sendOTPEmail(email: string, otp: string, name: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .otp-box { background: white; border: 2px solid #2563eb; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 SentinelPH</h1>
          <p>Community Intelligence Network</p>
        </div>
        <div class="content">
          <h2>Hello ${name},</h2>
          <p>Your One-Time Password (OTP) for SentinelPH registration is:</p>
          <div class="otp-box">${otp}</div>
          <p><strong>This OTP is valid for 10 minutes.</strong></p>
          <p>If you didn't request this OTP, please ignore this email.</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #e5e7eb;">
          <p style="font-size: 14px; color: #6b7280;">
            SentinelPH empowers communities to detect health outbreaks early through local observations.
          </p>
        </div>
        <div class="footer">
          <p>© 2024 SentinelPH. Empowering Communities, Protecting Health.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Your SentinelPH OTP Code',
    html,
  });
}

export async function sendRegistrationConfirmation(
  email: string,
  name: string,
  role: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .success-icon { font-size: 48px; text-align: center; margin: 20px 0; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #10b981; margin: 20px 0; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 SentinelPH</h1>
          <p>Welcome to the Community Intelligence Network</p>
        </div>
        <div class="content">
          <div class="success-icon">✅</div>
          <h2>Registration Successful!</h2>
          <p>Hello <strong>${name}</strong>,</p>
          <p>Welcome to SentinelPH! Your registration as a <strong>${role}</strong> has been confirmed.</p>
          
          <div class="info-box">
            <h3>What's Next?</h3>
            <ul>
              <li>Complete your 15-minute training module</li>
              <li>Pass the comprehension check (3 questions)</li>
              <li>Start submitting observations</li>
              <li>Build your trust score</li>
            </ul>
          </div>

          <div class="info-box">
            <h3>Your Role: ${role}</h3>
            <p>As a community sentinel, you'll help detect health outbreaks early by reporting observations like:</p>
            <ul>
              <li>Increased medication purchases</li>
              <li>Illness mentions in conversations</li>
              <li>Absence patterns in your community</li>
              <li>Environmental health concerns</li>
            </ul>
          </div>

          <center>
            <a href="${process.env.FRONTEND_URL}/training" class="button">Start Training</a>
          </center>

          <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
            <strong>Remember:</strong> Your first 5 observations will be reviewed by a Barangay Health Worker as part of your trial period.
          </p>
        </div>
        <div class="footer">
          <p>© 2024 SentinelPH. Empowering Communities, Protecting Health.</p>
          <p>Need help? Contact your Barangay Health Worker</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to SentinelPH - Registration Confirmed',
    html,
  });
}

export async function sendWelcomeEmail(
  email: string,
  name: string,
  role: string,
  barangay: string
) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #10b981 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
        .badge { display: inline-block; background: #fbbf24; color: #78350f; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; }
        .stats { display: flex; justify-content: space-around; margin: 20px 0; }
        .stat-box { text-align: center; background: white; padding: 15px; border-radius: 8px; flex: 1; margin: 0 5px; }
        .stat-number { font-size: 24px; font-weight: bold; color: #2563eb; }
        .footer { text-align: center; margin-top: 20px; color: #6b7280; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 SentinelPH</h1>
          <p style="font-size: 18px;">You're Now a Community Sentinel!</p>
        </div>
        <div class="content">
          <h2>Congratulations, ${name}! 🎉</h2>
          <p>You've completed your training and are now an active sentinel in <strong>${barangay}</strong>.</p>
          
          <center>
            <div class="badge">🏅 ${role.toUpperCase()}</div>
          </center>

          <div class="stats">
            <div class="stat-box">
              <div class="stat-number">50</div>
              <div>Trust Score</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">0</div>
              <div>Observations</div>
            </div>
            <div class="stat-box">
              <div class="stat-number">Trial</div>
              <div>Status</div>
            </div>
          </div>

          <h3>Quick Tips:</h3>
          <ul>
            <li>📊 Submit quality observations to increase your trust score</li>
            <li>✅ Your first 5 observations will be reviewed by BHW</li>
            <li>🎯 Maximum 5 observations per day</li>
            <li>⏱️ 15-minute cooldown between submissions</li>
            <li>🏆 Earn rewards for verified observations</li>
          </ul>

          <h3>What to Report:</h3>
          <ul>
            <li>Increased medication purchases (paracetamol, ORS, etc.)</li>
            <li>Multiple people mentioning similar symptoms</li>
            <li>Unusual absence patterns in your community</li>
            <li>Environmental health concerns (standing water, etc.)</li>
          </ul>

          <p style="margin-top: 30px; padding: 15px; background: #fef3c7; border-left: 4px solid #fbbf24; border-radius: 4px;">
            <strong>💡 Pro Tip:</strong> Focus on patterns, not individual cases. "5 customers bought Biogesic today" is better than "Someone is sick."
          </p>
        </div>
        <div class="footer">
          <p>© 2024 SentinelPH. Empowering Communities, Protecting Health.</p>
          <p>Questions? Contact your Barangay Health Worker</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: email,
    subject: 'Welcome to SentinelPH - You\'re Now Active!',
    html,
  });
}

export default { sendOTPEmail, sendRegistrationConfirmation, sendWelcomeEmail };
