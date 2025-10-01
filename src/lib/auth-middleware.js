import { JWTService } from './jwt';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Middleware to verify JWT token and extract user information
 * @param {Request} request - The incoming request
 * @param {Object} options - Options for the middleware
 * @param {Array} options.requiredRoles - Array of roles that can access this endpoint
 * @param {Array} options.requiredStatus - Array of statuses that can access this endpoint
 * @returns {Object} - { success: boolean, user?: Object, error?: NextResponse }
 */
export async function verifyAuth(request, options = {}) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return {
        success: false,
        error: NextResponse.json(
          { success: false, message: 'Authentication required' },
          { status: 401 }
        )
      };
    }

    // Verify access token
    const decoded = JWTService.verifyAccessToken(token);

    // Check if token has required type
    if (decoded.type !== 'access') {
      return {
        success: false,
        error: NextResponse.json(
          { success: false, message: 'Invalid token type' },
          { status: 401 }
        )
      };
    }

    // Check required roles
    if (options.requiredRoles && !options.requiredRoles.includes(decoded.role)) {
      return {
        success: false,
        error: NextResponse.json(
          { success: false, message: 'Insufficient permissions' },
          { status: 403 }
        )
      };
    }

    // Check required status
    if (options.requiredStatus && !options.requiredStatus.includes(decoded.status)) {
      return {
        success: false,
        error: NextResponse.json(
          { success: false, message: 'Account not active' },
          { status: 403 }
        )
      };
    }

    return {
      success: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role,
        status: decoded.status
      }
    };

  } catch (error) {
    console.error('Auth verification error:', error);
    
    if (error.message.includes('Invalid or expired')) {
      return {
        success: false,
        error: NextResponse.json(
          { success: false, message: 'Invalid or expired token' },
          { status: 401 }
        )
      };
    }

    return {
      success: false,
      error: NextResponse.json(
        { success: false, message: 'Authentication failed' },
        { status: 500 }
      )
    };
  }
}

/**
 * Higher-order function to wrap API routes with authentication
 * @param {Function} handler - The API route handler
 * @param {Object} options - Authentication options
 * @returns {Function} - Wrapped handler with authentication
 */
export function withAuth(handler, options = {}) {
  return async function(request, context) {
    const authResult = await verifyAuth(request, options);
    
    if (!authResult.success) {
      return authResult.error;
    }

    // Add user to request object
    request.user = authResult.user;
    
    return handler(request, context);
  };
}

/**
 * Role-based access control helper
 */
export const ROLES = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  CONTENT_EDITOR: 'Content Editor',
  REVIEWER: 'Reviewer',
  ANALYST: 'Analyst',
  STUDENT: 'Student'
};

/**
 * Status-based access control helper
 */
export const STATUS = {
  ACTIVE: 'Active',
  APPROVED: 'Approved',
  PENDING: 'Pending',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended'
};
