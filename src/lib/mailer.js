import nodemailer from 'nodemailer';

const missingConfig = () => {
  console.warn('[mailer] SMTP configuration missing; email not sent');
  return {
    success: false,
    error: 'SMTP not configured',
  };
};

const buildTransporter = () => {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

export async function sendMail({ to, subject, text, html }) {
  const transporter = buildTransporter();

  if (!transporter) {
    return missingConfig();
  }

  const fromAddress = process.env.FROM_EMAIL || (process.env.SMTP_USER ? `UnicomTIC Quiz <${process.env.SMTP_USER}>` : undefined);
  const info = await transporter.sendMail({
    from: fromAddress,
    to: Array.isArray(to) ? to.join(',') : to,
    subject,
    text,
    html: html || (text ? `<pre>${text}</pre>` : undefined),
  });

  return {
    success: true,
    id: info.messageId,
  };
}


