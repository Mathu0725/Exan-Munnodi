import { sendMail } from '@/lib/mailer';

export async function POST(request) {
  const { to = [], subject = '', text = '', html } = await request.json();

  try {
    const result = await sendMail({
      to,
      subject,
      text,
      html,
    });

    if (!result.success) {
      return new Response(JSON.stringify({ error: result.error || 'Email sending failed' }), { status: 500 });
    }

    return Response.json({ success: true, id: result.id });
  } catch (error) {
    console.error('SMTP Error:', error.message);
    return new Response(JSON.stringify({ 
      error: 'Email sending failed', 
      details: error.message 
    }), { status: 500 });
  }
}


