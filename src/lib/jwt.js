import jwt from 'jsonwebtoken';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key-for-development-only';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret-key-for-development-only';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Only throw error in production
if (process.env.NODE_ENV === 'production' && (!JWT_SECRET || !JWT_REFRESH_SECRET)) {
  throw new Error('JWT_SECRET and JWT_REFRESH_SECRET must be defined in environment variables');
}

export class JWTService {
  /**
   * Generate access token
   */
  static generateAccessToken(payload) {
    return jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        role: payload.role,
        status: payload.status,
        type: 'access'
      },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
        issuer: 'exam-munnodi',
        audience: 'exam-munnodi-users'
      }
    );
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload) {
    return jwt.sign(
      {
        id: payload.id,
        email: payload.email,
        type: 'refresh'
      },
      JWT_REFRESH_SECRET,
      {
        expiresIn: JWT_REFRESH_EXPIRES_IN,
        issuer: 'exam-munnodi',
        audience: 'exam-munnodi-users'
      }
    );
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET, {
        issuer: 'exam-munnodi',
        audience: 'exam-munnodi-users'
      });
    } catch (error) {
      throw new Error('Invalid or expired access token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token) {
    try {
      return jwt.verify(token, JWT_REFRESH_SECRET, {
        issuer: 'exam-munnodi',
        audience: 'exam-munnodi-users'
      });
    } catch (error) {
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Store refresh token in database
   */
  static async storeRefreshToken(userId, refreshToken) {
    try {
      // Remove old refresh tokens for this user
      await prisma.refreshToken.deleteMany({
        where: { userId }
      });

      // Store new refresh token
      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
        }
      });
    } catch (error) {
      console.error('Error storing refresh token:', error);
      throw new Error('Failed to store refresh token');
    }
  }

  /**
   * Validate refresh token from database
   */
  static async validateRefreshToken(refreshToken) {
    try {
      const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true }
      });

      if (!tokenRecord) {
        throw new Error('Refresh token not found');
      }

      if (tokenRecord.expiresAt < new Date()) {
        // Clean up expired token
        await prisma.refreshToken.delete({
          where: { id: tokenRecord.id }
        });
        throw new Error('Refresh token expired');
      }

      return tokenRecord.user;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  /**
   * Revoke refresh token
   */
  static async revokeRefreshToken(refreshToken) {
    try {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
      });
    } catch (error) {
      console.error('Error revoking refresh token:', error);
    }
  }

  /**
   * Revoke all refresh tokens for user
   */
  static async revokeAllUserTokens(userId) {
    try {
      await prisma.refreshToken.deleteMany({
        where: { userId }
      });
    } catch (error) {
      console.error('Error revoking user tokens:', error);
    }
  }

  /**
   * Generate token pair (access + refresh)
   */
  static async generateTokenPair(user) {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);
    
    // Store refresh token in database
    await this.storeRefreshToken(user.id, refreshToken);
    
    return { accessToken, refreshToken };
  }

  /**
   * Refresh access token using refresh token
   */
  static async refreshAccessToken(refreshToken) {
    try {
      // Validate refresh token from database
      const user = await this.validateRefreshToken(refreshToken);
      
      // Generate new access token
      const newAccessToken = this.generateAccessToken(user);
      
      return { accessToken: newAccessToken, user };
    } catch (error) {
      throw new Error('Failed to refresh access token');
    }
  }

  /**
   * Clean up expired tokens
   */
  static async cleanupExpiredTokens() {
    try {
      const result = await prisma.refreshToken.deleteMany({
        where: {
          expiresAt: {
            lt: new Date()
          }
        }
      });
      
      console.log(`Cleaned up ${result.count} expired refresh tokens`);
      return result.count;
    } catch (error) {
      console.error('Error cleaning up expired tokens:', error);
      return 0;
    }
  }
}

// Clean up expired tokens every hour
setInterval(() => {
  JWTService.cleanupExpiredTokens();
}, 60 * 60 * 1000);

