import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma.js';

async function main() {
  const email = 'geminipro09999@gmail.com';
  const plainPassword = 'Mathusan1999';

  const password = await bcrypt.hash(plainPassword, 10);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const updated = await prisma.user.update({
      where: { email },
      data: {
        name: existing.name || 'Super Admin',
        password,
        role: 'Super Admin',
        status: 'Active',
      },
    });
    console.log('Updated existing admin:', updated.email);
  } else {
    const created = await prisma.user.create({
      data: {
        name: 'Super Admin',
        email,
        password,
        role: 'Super Admin',
        status: 'Active',
      },
    });
    console.log('Created admin:', created.email);
  }
}

main()
  .catch((e) => {
    console.error('Create admin error:', e);
    process.exit(1);
  })
  .finally(async () => {
    try { await prisma.$disconnect(); } catch {}
  });


