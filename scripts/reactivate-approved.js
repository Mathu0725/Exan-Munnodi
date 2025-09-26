import { PrismaClient } from '@prisma/client';

async function main() {
  const prisma = new PrismaClient();
  try {
    const result = await prisma.user.updateMany({
      where: { status: 'Approved' },
      data: { status: 'Active' },
    });

    console.log(`Updated ${result.count} user(s) from Approved to Active.`);
  } catch (error) {
    console.error('Failed to update users:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
