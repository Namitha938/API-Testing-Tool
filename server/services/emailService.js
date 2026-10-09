const nodemailer = require('nodemailer');

let cachedTransporter = null;

/**
 * Initializes and returns the Nodemailer transporter.
 * Supports custom SMTP configurations, or auto-fallback for local development.
 */
async function getTransporter() {
  if (cachedTransporter) return cachedTransporter;

  const host = process.env.SMTP_HOST;
  const port = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const secure = process.env.SMTP_SECURE === 'true' || port === 465;

  if (host && user && pass) {
    cachedTransporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
      tls: {
        rejectUnauthorized: false,
      },
    });
    console.log(`[Email Service] Configured live SMTP transport with host: ${host}:${port}`);
    return cachedTransporter;
  }

  // If no SMTP configured, use a development stream transporter or ethereal test account
  console.log('[Email Service] No external SMTP credentials detected in .env. Initializing development email dispatcher...');
  
  cachedTransporter = nodemailer.createTransport({
    streamTransport: true,
    newline: 'unix',
    buffer: true,
  });

  return cachedTransporter;
}

/**
 * Sends a password reset OTP verification code email.
 *
 * @param {Object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.otp - 6-digit verification code
 * @param {string} options.name - Recipient user name
 */
async function sendPasswordResetOtp({ to, otp, name = 'Developer' }) {
  const from = process.env.EMAIL_FROM || '"APITester Studio" <no-reply@apitester.io>';
  const transporter = await getTransporter();

  const subject = `APITester Verification Code: ${otp}`;
  const textContent = `
Hello ${name},

We received a request to reset the password for your APITester Studio account (${to}).

Your One-Time Verification Code (OTP) is:
${otp}

This verification code will expire in 10 minutes.
If you did not request a password reset, you can safely ignore this email. Your password will remain unchanged.

Best regards,
The APITester Team
`;

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="margin: 0; padding: 0; background-color: #0b0f19; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #f1f5f9;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0b0f19; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width: 520px; background-color: #111827; border: 1px solid #1f2937; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
          
          <!-- Header -->
          <tr>
            <td style="padding: 32px 32px 24px; text-align: center; border-bottom: 1px solid #1f2937; background: linear-gradient(135deg, rgba(14, 165, 233, 0.1) 0%, rgba(99, 102, 241, 0.1) 100%);">
              <div style="display: inline-block; width: 44px; height: 44px; background: linear-gradient(135deg, #0284c7 0%, #4f46e5 100%); border-radius: 12px; line-height: 44px; text-align: center; font-size: 22px; margin-bottom: 12px;">
                ⚡
              </div>
              <h1 style="margin: 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">APITester Studio</h1>
              <p style="margin: 6px 0 0; font-size: 13px; color: #94a3b8;">Password Reset Verification</p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              <p style="margin: 0 0 16px; font-size: 14px; line-height: 1.6; color: #cbd5e1;">
                Hello <strong>${name}</strong>,
              </p>
              <p style="margin: 0 0 24px; font-size: 14px; line-height: 1.6; color: #94a3b8;">
                We received a request to reset the password for your APITester account. Enter the verification code below on the recovery screen:
              </p>

              <!-- OTP Code Display Card -->
              <div style="background-color: #0f172a; border: 1px solid #334155; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px;">
                <span style="display: block; font-size: 11px; text-transform: uppercase; letter-spacing: 1.5px; color: #38bdf8; font-weight: 700; margin-bottom: 8px;">One-Time Verification Code</span>
                <span style="display: inline-block; font-size: 36px; font-weight: 800; font-family: 'Courier New', Courier, monospace; letter-spacing: 8px; color: #ffffff; background: linear-gradient(135deg, #38bdf8 0%, #818cf8 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                  ${otp}
                </span>
                <span style="display: block; font-size: 12px; color: #94a3b8; margin-top: 10px;">
                  ⏱️ Valid for <strong>10 minutes</strong> &bull; Single-use only
                </span>
              </div>

              <!-- Security Notice -->
              <div style="background-color: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); border-radius: 10px; padding: 14px 16px; margin: 0 0 24px;">
                <p style="margin: 0; font-size: 12px; line-height: 1.5; color: #fbbf24;">
                  🛡️ <strong>Security Tip:</strong> Never share this verification code with anyone. APITester staff will never ask for your code. If you didn't request this reset, your account is safe and you can ignore this message.
                </p>
              </div>

              <p style="margin: 0; font-size: 12px; color: #64748b; line-height: 1.5;">
                Need help? Contact your workspace administrator or reply to this email.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 32px; background-color: #090d16; border-top: 1px solid #1f2937; text-align: center;">
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                &copy; ${new Date().getFullYear()} APITester Studio Inc. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  try {
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      text: textContent,
      html: htmlContent,
    });

    console.log(`[Email Service] Password reset OTP sent to: ${to} (Message ID: ${info.messageId || 'dev-stream'})`);

    // In local dev without live SMTP, log code to console for instant developer feedback
    if (!process.env.SMTP_USER) {
      console.log(`=======================================================`);
      console.log(`[DEV EMAIL SIMULATION] Verification OTP for ${to}: ${otp}`);
      console.log(`=======================================================`);
    }

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[Email Service] Failed to send email to ${to}:`, error.message);
    throw error;
  }
}

module.exports = {
  sendPasswordResetOtp,
  getTransporter,
};

