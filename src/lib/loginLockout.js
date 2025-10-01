import prisma from '@/lib/prisma';

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const CLEANUP_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function checkLoginLockout(email, ipAddress) {
  const now = new Date();
  const lockoutThreshold = new Date(now.getTime() - LOCKOUT_DURATION_MS);

  // Count recent failed attempts for this email
  const recentFailures = await prisma.loginAttempt.count({
    where: {
      email: email.toLowerCase(),
      success: false,
      createdAt: { gte: lockoutThreshold },
    },
  });

  if (recentFailures >= MAX_ATTEMPTS) {
    return {
      locked: true,
      message: `Too many failed login attempts. Please try again in ${Math.ceil(LOCKOUT_DURATION_MS / 60000)} minutes.`,
    };
  }

  // Count recent failed attempts for this IP
  const ipFailures = await prisma.loginAttempt.count({
    where: {
      ipAddress,
      success: false,
      createdAt: { gte: lockoutThreshold },
    },
  });

  if (ipFailures >= MAX_ATTEMPTS) {
    return {
      locked: true,
      message: `Too many failed login attempts from this IP. Please try again in ${Math.ceil(LOCKOUT_DURATION_MS / 60000)} minutes.`,
    };
  }

  return { locked: false };
}

export async function recordLoginAttempt(email, ipAddress, userAgent, success) {
  await prisma.loginAttempt.create({
    data: {
      email: email.toLowerCase(),
      ipAddress,
      userAgent,
      success,
    },
  });

  // Clean up old attempts (run occasionally, not on every request)
  if (Math.random() < 0.1) {
    // 10% chance
    await cleanupOldAttempts();
  }
}

async function cleanupOldAttempts() {
  const cutoff = new Date(Date.now() - CLEANUP_AGE_MS);
  await prisma.loginAttempt.deleteMany({
    where: {
      createdAt: { lt: cutoff },
    },
  });
}
