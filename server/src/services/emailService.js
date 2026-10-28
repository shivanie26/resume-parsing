const nodemailer = require('nodemailer');

const RECIPIENT_EMAIL = process.env.ADMIN_EMAIL || 'eshivani26@gmail.com';

/**
 * Creates nodemailer transport if credentials exist
 */
function createTransporter() {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  return null;
}

/**
 * Sends contact inquiry email to eshivani26@gmail.com
 * @param {object} contactData { name, email, message }
 * @returns {Promise<{ sent: boolean, reason?: string }>}
 */
async function sendContactEmail({ name, email, message }) {
  const transporter = createTransporter();

  if (!transporter) {
    console.log(`[EmailService] Notice: SMTP credentials not yet provided in server/.env (EMAIL_USER / EMAIL_PASS). Message saved to MongoDB for ${RECIPIENT_EMAIL}.`);
    return {
      sent: false,
      reason: 'SMTP credentials not configured in server/.env'
    };
  }

  try {
    const mailOptions = {
      from: `HireSmart Platform <${process.env.EMAIL_USER || 'no-reply@hiresmart.local'}>`,
      to: RECIPIENT_EMAIL,
      replyTo: email,
      subject: `[HireSmart Contact Inquiry] Message from ${name}`,
      text: `You have received a new contact inquiry from HireSmart:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}\n\nSent: ${new Date().toLocaleString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background-color: #2563eb; color: #ffffff; padding: 20px; text-align: center;">
            <h2 style="margin: 0;">HireSmart Inquiry</h2>
            <p style="margin: 5px 0 0 0; font-size: 14px;">Smart Resume & Competency Assessment Platform</p>
          </div>
          <div style="padding: 24px; color: #334155;">
            <p><strong>Sender Name:</strong> ${name}</p>
            <p><strong>Sender Email:</strong> <a href="mailto:${email}" style="color: #2563eb;">${email}</a></p>
            <p><strong>Received At:</strong> ${new Date().toLocaleString()}</p>
            <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p><strong>Message Content:</strong></p>
            <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; white-space: pre-wrap; font-size: 14px;">${message}</div>
          </div>
          <div style="background-color: #f1f5f9; padding: 12px; text-align: center; font-size: 12px; color: #64748b;">
            Direct reply to this email will respond to <strong>${email}</strong>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] Contact email successfully delivered to ${RECIPIENT_EMAIL} (Message ID: ${info.messageId})`);
    return { sent: true, messageId: info.messageId };
  } catch (error) {
    console.error('[EmailService] Error delivering email via SMTP:', error.message);
    return { sent: false, reason: error.message };
  }
}

module.exports = {
  sendContactEmail,
  RECIPIENT_EMAIL
};
