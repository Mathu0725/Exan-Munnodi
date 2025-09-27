import prisma from '../src/lib/prisma.js';

try {
  const row = await prisma.passwordResetToken.findFirst({
    orderBy: { createdAt: 'desc' },
    include: { user: true },
  });

  if (!row) {
    console.log('No password reset tokens found.');
    process.exit(1);
  }

  console.log(JSON.stringify({
    email: row.user?.email,
    token: row.token,
    otp: row.otp,
    expiresAt: row.expiresAt,
    usedAt: row.usedAt,
  }, null, 2));
} catch (err) {
  console.error('Failed to read latest reset token:', err.message);
  process.exit(1);
} finally {
  try { await prisma.$disconnect(); } catch {}
}


