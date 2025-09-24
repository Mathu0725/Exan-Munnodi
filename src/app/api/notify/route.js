import nodemailer from 'nodemailer';

export async function POST(request) {
  const { to = [], subject = '', text = '', html } = await request.json();

  if (!process.env.SMTP_HOST) {
    return new Response(JSON.stringify({ error: 'SMTP not configured' }), { status: 500 });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: Number(process.env.SMTP_PORT || 587) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL,
    to: Array.isArray(to) ? to.join(',') : String(to),
    subject,
    text,
    html: html || `<pre>${text}</pre>`,
  });

  return Response.json({ success: true, id: info.messageId });
}


