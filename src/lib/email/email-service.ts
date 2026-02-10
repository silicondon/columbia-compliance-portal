/**
 * Email Service
 *
 * Handles sending emails using Nodemailer or configured email provider
 */

interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using the configured email service
 */
export async function sendEmail(options: EmailOptions): Promise<EmailResult> {
  // In development/mock mode, just log the email
  if (process.env.NODE_ENV === 'development' || !process.env.EMAIL_SERVICE_ENABLED) {
    console.log('[Email Service] Mock email sent:', {
      to: options.to,
      subject: options.subject,
      preview: options.text?.substring(0, 100) || options.html.substring(0, 100),
    });

    return {
      success: true,
      messageId: `mock-${Date.now()}`,
    };
  }

  // In production, use actual email service
  try {
    // TODO: Integrate with actual email service (SendGrid, AWS SES, etc.)
    // Example with nodemailer:
    // const nodemailer = require('nodemailer');
    // const transporter = nodemailer.createTransport({
    //   host: process.env.SMTP_HOST,
    //   port: process.env.SMTP_PORT,
    //   secure: true,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASSWORD,
    //   },
    // });
    //
    // const info = await transporter.sendMail({
    //   from: options.from || process.env.EMAIL_FROM,
    //   to: Array.isArray(options.to) ? options.to.join(',') : options.to,
    //   subject: options.subject,
    //   text: options.text,
    //   html: options.html,
    // });
    //
    // return {
    //   success: true,
    //   messageId: info.messageId,
    // };

    console.warn('[Email Service] Production email service not configured. Email not sent.');

    return {
      success: false,
      error: 'Email service not configured',
    };
  } catch (error) {
    console.error('[Email Service] Error sending email:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Send an email to multiple recipients
 */
export async function sendBulkEmail(
  recipients: string[],
  subject: string,
  html: string,
  text?: string
): Promise<EmailResult[]> {
  const results: EmailResult[] = [];

  for (const recipient of recipients) {
    const result = await sendEmail({
      to: recipient,
      subject,
      html,
      text,
    });

    results.push(result);
  }

  return results;
}

/**
 * Email service configuration
 */
export const emailConfig = {
  from: process.env.EMAIL_FROM || 'noreply@columbia.edu',
  replyTo: process.env.EMAIL_REPLY_TO || 'insurance@columbia.edu',
  enabled: process.env.EMAIL_SERVICE_ENABLED === 'true',
};
