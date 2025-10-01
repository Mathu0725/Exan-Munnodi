import { prisma as optimizedPrisma } from './database/connectionPool.js';

// Export the optimized Prisma client
export const prisma = optimizedPrisma;

// For backward compatibility, also export as default
export default prisma;
