import prisma from '@/lib/prisma';
import logger from '@/lib/logger';

/**
 * Health check system for monitoring application status
 */

/**
 * Health check status types
 */
export const HEALTH_STATUS = {
  HEALTHY: 'healthy',
  UNHEALTHY: 'unhealthy',
  DEGRADED: 'degraded',
  UNKNOWN: 'unknown',
};

/**
 * Health check result structure
 */
export class HealthCheckResult {
  constructor(name, status, message = '', details = {}) {
    this.name = name;
    this.status = status;
    this.message = message;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Database health check
 * @returns {Promise<HealthCheckResult>} - Database health status
 */
export async function checkDatabase() {
  try {
    const startTime = Date.now();

    // Test database connection
    await prisma.$queryRaw`SELECT 1`;

    const responseTime = Date.now() - startTime;

    // Check if response time is acceptable
    const isHealthy = responseTime < 1000; // 1 second threshold

    return new HealthCheckResult(
      'database',
      isHealthy ? HEALTH_STATUS.HEALTHY : HEALTH_STATUS.DEGRADED,
      isHealthy ? 'Database connection healthy' : 'Database response time slow',
      {
        responseTime: `${responseTime}ms`,
        threshold: '1000ms',
      }
    );
  } catch (error) {
    logger.error('Database health check failed', { error: error.message });
    return new HealthCheckResult(
      'database',
      HEALTH_STATUS.UNHEALTHY,
      'Database connection failed',
      { error: error.message }
    );
  }
}

/**
 * Memory health check
 * @returns {HealthCheckResult} - Memory health status
 */
export function checkMemory() {
  try {
    const memUsage = process.memoryUsage();
    const totalMB = Math.round(memUsage.heapTotal / 1024 / 1024);
    const usedMB = Math.round(memUsage.heapUsed / 1024 / 1024);
    const externalMB = Math.round(memUsage.external / 1024 / 1024);

    const usagePercentage = (usedMB / totalMB) * 100;

    let status = HEALTH_STATUS.HEALTHY;
    let message = 'Memory usage normal';

    if (usagePercentage > 90) {
      status = HEALTH_STATUS.UNHEALTHY;
      message = 'Memory usage critical';
    } else if (usagePercentage > 80) {
      status = HEALTH_STATUS.DEGRADED;
      message = 'Memory usage high';
    }

    return new HealthCheckResult('memory', status, message, {
      heapTotal: `${totalMB}MB`,
      heapUsed: `${usedMB}MB`,
      external: `${externalMB}MB`,
      usagePercentage: `${usagePercentage.toFixed(2)}%`,
    });
  } catch (error) {
    logger.error('Memory health check failed', { error: error.message });
    return new HealthCheckResult(
      'memory',
      HEALTH_STATUS.UNKNOWN,
      'Memory check failed',
      { error: error.message }
    );
  }
}

/**
 * Disk space health check
 * @returns {Promise<HealthCheckResult>} - Disk space health status
 */
export async function checkDiskSpace() {
  try {
    const fs = await import('fs/promises');
    const stats = (await fs.statvfs) ? await fs.statvfs('.') : null;

    if (!stats) {
      // Fallback for systems without statvfs
      return new HealthCheckResult(
        'disk',
        HEALTH_STATUS.UNKNOWN,
        'Disk space check not available on this system',
        {}
      );
    }

    const totalSpace = stats.f_blocks * stats.f_frsize;
    const freeSpace = stats.f_bavail * stats.f_frsize;
    const usedSpace = totalSpace - freeSpace;
    const usagePercentage = (usedSpace / totalSpace) * 100;

    let status = HEALTH_STATUS.HEALTHY;
    let message = 'Disk space normal';

    if (usagePercentage > 95) {
      status = HEALTH_STATUS.UNHEALTHY;
      message = 'Disk space critical';
    } else if (usagePercentage > 85) {
      status = HEALTH_STATUS.DEGRADED;
      message = 'Disk space low';
    }

    return new HealthCheckResult('disk', status, message, {
      totalSpace: `${Math.round(totalSpace / 1024 / 1024 / 1024)}GB`,
      freeSpace: `${Math.round(freeSpace / 1024 / 1024 / 1024)}GB`,
      usedSpace: `${Math.round(usedSpace / 1024 / 1024 / 1024)}GB`,
      usagePercentage: `${usagePercentage.toFixed(2)}%`,
    });
  } catch (error) {
    logger.error('Disk space health check failed', { error: error.message });
    return new HealthCheckResult(
      'disk',
      HEALTH_STATUS.UNKNOWN,
      'Disk space check failed',
      { error: error.message }
    );
  }
}

/**
 * External service health check
 * @param {string} serviceName - Name of the service
 * @param {Function} checkFunction - Function to check the service
 * @returns {Promise<HealthCheckResult>} - Service health status
 */
export async function checkExternalService(serviceName, checkFunction) {
  try {
    const result = await checkFunction();
    return new HealthCheckResult(
      serviceName,
      result.healthy ? HEALTH_STATUS.HEALTHY : HEALTH_STATUS.UNHEALTHY,
      result.message || `${serviceName} check completed`,
      result.details || {}
    );
  } catch (error) {
    logger.error(`${serviceName} health check failed`, {
      error: error.message,
    });
    return new HealthCheckResult(
      serviceName,
      HEALTH_STATUS.UNHEALTHY,
      `${serviceName} check failed`,
      { error: error.message }
    );
  }
}

/**
 * Application uptime health check
 * @returns {HealthCheckResult} - Uptime health status
 */
export function checkUptime() {
  const uptime = process.uptime();
  const uptimeHours = Math.floor(uptime / 3600);
  const uptimeMinutes = Math.floor((uptime % 3600) / 60);
  const uptimeSeconds = Math.floor(uptime % 60);

  return new HealthCheckResult(
    'uptime',
    HEALTH_STATUS.HEALTHY,
    `Application running for ${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`,
    {
      uptimeSeconds: Math.floor(uptime),
      uptimeFormatted: `${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s`,
      startTime: new Date(Date.now() - uptime * 1000).toISOString(),
    }
  );
}

/**
 * Environment health check
 * @returns {HealthCheckResult} - Environment health status
 */
export function checkEnvironment() {
  const requiredEnvVars = ['DATABASE_URL', 'JWT_SECRET', 'NODE_ENV'];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  let status = HEALTH_STATUS.HEALTHY;
  let message = 'Environment configuration healthy';

  if (missingVars.length > 0) {
    status = HEALTH_STATUS.UNHEALTHY;
    message = `Missing required environment variables: ${missingVars.join(', ')}`;
  }

  return new HealthCheckResult('environment', status, message, {
    nodeVersion: process.version,
    platform: process.platform,
    arch: process.arch,
    nodeEnv: process.env.NODE_ENV,
    missingVars,
  });
}

/**
 * Comprehensive health check
 * @param {Object} options - Health check options
 * @returns {Promise<Object>} - Complete health status
 */
export async function performHealthCheck(options = {}) {
  const {
    includeDatabase = true,
    includeMemory = true,
    includeDisk = true,
    includeUptime = true,
    includeEnvironment = true,
    externalServices = [],
  } = options;

  const checks = [];

  // Add core checks
  if (includeDatabase) checks.push(checkDatabase());
  if (includeMemory) checks.push(Promise.resolve(checkMemory()));
  if (includeDisk) checks.push(checkDiskSpace());
  if (includeUptime) checks.push(Promise.resolve(checkUptime()));
  if (includeEnvironment) checks.push(Promise.resolve(checkEnvironment()));

  // Add external service checks
  externalServices.forEach(service => {
    checks.push(checkExternalService(service.name, service.checkFunction));
  });

  // Execute all checks
  const results = await Promise.all(checks);

  // Determine overall status
  const hasUnhealthy = results.some(
    result => result.status === HEALTH_STATUS.UNHEALTHY
  );
  const hasDegraded = results.some(
    result => result.status === HEALTH_STATUS.DEGRADED
  );

  let overallStatus = HEALTH_STATUS.HEALTHY;
  if (hasUnhealthy) {
    overallStatus = HEALTH_STATUS.UNHEALTHY;
  } else if (hasDegraded) {
    overallStatus = HEALTH_STATUS.DEGRADED;
  }

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0',
    checks: results,
    summary: {
      total: results.length,
      healthy: results.filter(r => r.status === HEALTH_STATUS.HEALTHY).length,
      degraded: results.filter(r => r.status === HEALTH_STATUS.DEGRADED).length,
      unhealthy: results.filter(r => r.status === HEALTH_STATUS.UNHEALTHY)
        .length,
      unknown: results.filter(r => r.status === HEALTH_STATUS.UNKNOWN).length,
    },
  };
}

/**
 * Quick health check for load balancers
 * @returns {Promise<Object>} - Quick health status
 */
export async function quickHealthCheck() {
  try {
    // Only check database for quick health check
    const dbResult = await checkDatabase();

    return {
      status: dbResult.status === HEALTH_STATUS.HEALTHY ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      database: dbResult.status,
    };
  } catch (error) {
    logger.error('Quick health check failed', { error: error.message });
    return {
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message,
    };
  }
}
