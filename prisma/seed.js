import bcrypt from 'bcryptjs';
import prisma from '../src/lib/prisma.js';

async function main() {
  const adminEmail = 'admin@example.com';

  const adminPassword = await bcrypt.hash('Admin@123', 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: 'Default Admin',
      role: 'Admin',
      status: 'Active',
      password: adminPassword,
    },
    create: {
      name: 'Default Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'Admin',
      status: 'Active',
    },
  });

  console.log('Admin user ensured:', admin.email);

  const seedStudents = [
    {
      name: 'Pending Student',
      email: 'pending.student@example.com',
      status: 'Pending',
    },
    {
      name: 'Active Student',
      email: 'active.student@example.com',
      status: 'Active',
    },
    {
      name: 'Inactive Student',
      email: 'inactive.student@example.com',
      status: 'Inactive',
    },
  ];

  for (const student of seedStudents) {
    const existing = await prisma.user.findUnique({ where: { email: student.email } });
    if (!existing) {
      const password = await bcrypt.hash('Student@123', 10);
      await prisma.user.create({
        data: {
          name: student.name,
          email: student.email,
          password,
          role: 'Student',
          status: student.status,
          approvedById: student.status === 'Approved' ? admin.id : null,
        },
      });
      console.log(`Seeded user: ${student.email}`);
    }
  }
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
