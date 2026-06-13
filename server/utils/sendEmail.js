const nodemailer = require('nodemailer');

/**
 * Utility to send email notifications.
 * Falls back to printing to Node console if credentials are empty.
 * @param {Object} options - { to: string, subject: string, text: string, html: string }
 */
const sendEmail = async (options) => {
  const isSmtpConfigured = !!(
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS
  );

  if (!isSmtpConfigured) {
    console.log('--------------------------------------------------');
    console.log('✉️  EMAIL NOTIFICATION SEND SIMULATION (No SMTP Conf)');
    console.log(`TO:      ${options.to}`);
    console.log(`SUBJECT: ${options.subject}`);
    console.log(`BODY (Plain): ${options.text || 'N/A'}`);
    console.log('--------------------------------------------------');
    return { simulated: true };
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT) || 2525,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const message = {
      from: `Book A Doctor <${process.env.SMTP_FROM || 'noreply@bookadoctor.com'}>`,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
    };

    const info = await transporter.sendMail(message);
    console.log(`Email dispatched successfully. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error('Nodemailer Error:', error.message);
    // Return gracefully so database transaction / response does not fail
    return { error: error.message };
  }
};

module.exports = sendEmail;
