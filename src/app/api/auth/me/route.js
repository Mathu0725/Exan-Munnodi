export async function GET() {
  return Response.json({ success: false, message: 'Session-based auth not yet implemented.' }, { status: 501 });
}
