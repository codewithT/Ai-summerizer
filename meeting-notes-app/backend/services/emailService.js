const nodemailer = require('nodemailer');
require('dotenv').config();

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.USER_GMAIL,
        pass: process.env.USER_PASSWORD
      }
    });
  }

  async sendSummary(recipients, summary, subject = 'Meeting Notes Summary') {
    try {
      const mailOptions = {
        from: process.env.USER_GMAIL,
        to: recipients.join(', '),
        subject: subject,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Meeting Notes Summary</h2>
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
              <pre style="white-space: pre-wrap; font-family: Arial, sans-serif; line-height: 1.6;">
${summary}
              </pre>
            </div>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">
              This summary was generated using AI-powered Meeting Notes Summarizer
            </p>
          </div>
        `
      };

      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('Email sending error:', error);
      throw error;
    }
  }
}

module.exports = new EmailService();
