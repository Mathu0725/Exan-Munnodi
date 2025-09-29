/**
 * API Versioning Strategy
 * Supports multiple versioning approaches: URL path, header, and query parameter
 */

/**
 * API Version configuration
 */
export const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2',
  V3: 'v3',
  LATEST: 'v2', // Current latest version
  DEFAULT: 'v1', // Default version for backward compatibility
};

/**
 * Version status and lifecycle
 */
export const VERSION_STATUS = {
  ACTIVE: 'active',
  DEPRECATED: 'deprecated',
  SUNSET: 'sunset',
  BETA: 'beta',
  ALPHA: 'alpha',
};

/**
 * Version configuration for each API version
 */
export const VERSION_CONFIG = {
  [API_VERSIONS.V1]: {
    status: VERSION_STATUS.ACTIVE,
    releaseDate: '2024-01-01',
    sunsetDate: '2025-12-31',
    description: 'Initial API version with core functionality',
    changes: [
      'Basic CRUD operations',
      'Authentication system',
      'User management',
      'Question management',
    ],
  },
  [API_VERSIONS.V2]: {
    status: VERSION_STATUS.ACTIVE,
    releaseDate: '2024-09-01',
    sunsetDate: null,
    description: 'Enhanced API with improved security and performance',
    changes: [
      'Enhanced security headers',
      'Improved error handling',
      'Better validation',
      'Performance optimizations',
      'CSRF protection',
      'Rate limiting',
    ],
  },
  [API_VERSIONS.V3]: {
    status: VERSION_STATUS.BETA,
    releaseDate: '2024-12-01',
    sunsetDate: null,
    description: 'Next generation API with advanced features',
    changes: [
      'GraphQL support',
      'Real-time updates',
      'Advanced analytics',
      'Microservices architecture',
    ],
  },
};

/**
 * Extract version from request
 * @param {Request} request - The request object
 * @returns {string|null} - Extracted version or null
 */
export function extractVersionFromRequest(request) {
  const url = new URL(request.url);

  // 1. Check URL path versioning (/api/v1/...)
  const pathMatch = url.pathname.match(/^\/api\/(v\d+)\//);
  if (pathMatch) {
    return pathMatch[1];
  }

  // 2. Check header versioning (Accept: application/vnd.api+json;version=v1)
  const acceptHeader = request.headers.get('accept');
  if (acceptHeader) {
    const versionMatch = acceptHeader.match(/version=([^;,\s]+)/);
    if (versionMatch) {
      return versionMatch[1];
    }
  }

  // 3. Check custom header (X-API-Version: v1)
  const customHeader = request.headers.get('x-api-version');
  if (customHeader) {
    return customHeader;
  }

  // 4. Check query parameter (?version=v1)
  const queryVersion = url.searchParams.get('version');
  if (queryVersion) {
    return queryVersion;
  }

  return null;
}

/**
 * Get effective API version for request
 * @param {Request} request - The request object
 * @returns {string} - Effective API version
 */
export function getEffectiveVersion(request) {
  const extractedVersion = extractVersionFromRequest(request);

  if (extractedVersion && isValidVersion(extractedVersion)) {
    return extractedVersion;
  }

  return API_VERSIONS.DEFAULT;
}

/**
 * Check if version is valid
 * @param {string} version - Version to check
 * @returns {boolean} - Whether version is valid
 */
export function isValidVersion(version) {
  return Object.values(API_VERSIONS).includes(version);
}

/**
 * Get version configuration
 * @param {string} version - API version
 * @returns {Object|null} - Version configuration
 */
export function getVersionConfig(version) {
  return VERSION_CONFIG[version] || null;
}

/**
 * Check if version is active
 * @param {string} version - API version
 * @returns {boolean} - Whether version is active
 */
export function isVersionActive(version) {
  const config = getVersionConfig(version);
  return config && config.status === VERSION_STATUS.ACTIVE;
}

/**
 * Check if version is deprecated
 * @param {string} version - API version
 * @returns {boolean} - Whether version is deprecated
 */
export function isVersionDeprecated(version) {
  const config = getVersionConfig(version);
  return config && config.status === VERSION_STATUS.DEPRECATED;
}

/**
 * Check if version is sunset
 * @param {string} version - API version
 * @returns {boolean} - Whether version is sunset
 */
export function isVersionSunset(version) {
  const config = getVersionConfig(version);
  return config && config.status === VERSION_STATUS.SUNSET;
}

/**
 * Get version deprecation info
 * @param {string} version - API version
 * @returns {Object|null} - Deprecation information
 */
export function getVersionDeprecationInfo(version) {
  const config = getVersionConfig(version);
  if (!config) return null;

  return {
    version,
    status: config.status,
    sunsetDate: config.sunsetDate,
    description: config.description,
    alternativeVersion: API_VERSIONS.LATEST,
  };
}

/**
 * Create versioned response headers
 * @param {string} version - API version
 * @param {Response} response - Response object
 * @returns {Response} - Response with version headers
 */
export function addVersionHeaders(version, response) {
  const config = getVersionConfig(version);

  if (config) {
    response.headers.set('X-API-Version', version);
    response.headers.set('X-API-Status', config.status);

    if (config.sunsetDate) {
      response.headers.set('Sunset', config.sunsetDate);
    }

    if (isVersionDeprecated(version)) {
      response.headers.set('Deprecation', 'true');
      response.headers.set(
        'Link',
        `<${API_VERSIONS.LATEST}>; rel="successor-version"`
      );
    }
  }

  return response;
}

/**
 * Create version error response
 * @param {string} message - Error message
 * @param {number} statusCode - HTTP status code
 * @param {string} version - API version
 * @returns {Response} - Error response
 */
export function createVersionErrorResponse(message, statusCode, version) {
  const response = new Response(
    JSON.stringify({
      success: false,
      error: message,
      type: 'version_error',
      version,
      timestamp: new Date().toISOString(),
    }),
    {
      status: statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': version,
      },
    }
  );

  return addVersionHeaders(version, response);
}

/**
 * API versioning middleware
 * @param {Object} options - Middleware options
 * @returns {Function} - Middleware function
 */
export function createVersioningMiddleware(options = {}) {
  const {
    enforceVersion = true,
    allowUnversioned = false,
    defaultVersion = API_VERSIONS.DEFAULT,
    rejectDeprecated = false,
    rejectSunset = true,
  } = options;

  return async (request, next) => {
    const url = new URL(request.url);

    // Skip versioning for non-API routes
    if (!url.pathname.startsWith('/api/')) {
      return next(request);
    }

    const version = getEffectiveVersion(request);
    const config = getVersionConfig(version);

    // Check if version is valid
    if (!isValidVersion(version)) {
      return createVersionErrorResponse(
        `Invalid API version: ${version}. Supported versions: ${Object.values(API_VERSIONS).join(', ')}`,
        400,
        version
      );
    }

    // Check if version is sunset
    if (isVersionSunset(version) && rejectSunset) {
      return createVersionErrorResponse(
        `API version ${version} has been sunset and is no longer available`,
        410,
        version
      );
    }

    // Check if version is deprecated
    if (isVersionDeprecated(version) && rejectDeprecated) {
      return createVersionErrorResponse(
        `API version ${version} is deprecated. Please upgrade to ${API_VERSIONS.LATEST}`,
        410,
        version
      );
    }

    // Add version to request context
    request.apiVersion = version;
    request.versionConfig = config;

    // Process the request
    const response = await next(request);

    // Add version headers to response
    return addVersionHeaders(version, response);
  };
}

/**
 * Get API version info endpoint
 * @param {Request} request - The request object
 * @returns {Response} - Version information response
 */
export function getVersionInfo(request) {
  const version = getEffectiveVersion(request);
  const config = getVersionConfig(version);

  const versionInfo = {
    currentVersion: version,
    latestVersion: API_VERSIONS.LATEST,
    supportedVersions: Object.values(API_VERSIONS),
    versionConfig: config,
    deprecationInfo: getVersionDeprecationInfo(version),
  };

  return new Response(
    JSON.stringify({
      success: true,
      data: versionInfo,
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': version,
      },
    }
  );
}

/**
 * Create versioned route handler
 * @param {Object} handlers - Version-specific handlers
 * @param {Object} options - Handler options
 * @returns {Function} - Route handler
 */
export function createVersionedHandler(handlers, options = {}) {
  const { defaultHandler = null, fallbackToDefault = true } = options;

  return async (request, context) => {
    const version = getEffectiveVersion(request);
    const handler = handlers[version];

    if (handler) {
      return handler(request, context);
    }

    if (fallbackToDefault && defaultHandler) {
      return defaultHandler(request, context);
    }

    return createVersionErrorResponse(
      `API version ${version} not supported for this endpoint`,
      404,
      version
    );
  };
}

/**
 * Version migration utilities
 */
export const VERSION_MIGRATION = {
  /**
   * Migrate data between versions
   * @param {any} data - Data to migrate
   * @param {string} fromVersion - Source version
   * @param {string} toVersion - Target version
   * @returns {any} - Migrated data
   */
  migrateData(data, fromVersion, toVersion) {
    // Implement version-specific data migration logic
    if (fromVersion === API_VERSIONS.V1 && toVersion === API_VERSIONS.V2) {
      // Example: Add new fields or transform existing ones
      return {
        ...data,
        version: toVersion,
        migratedAt: new Date().toISOString(),
      };
    }

    return data;
  },

  /**
   * Get migration path between versions
   * @param {string} fromVersion - Source version
   * @param {string} toVersion - Target version
   * @returns {Array} - Migration steps
   */
  getMigrationPath(fromVersion, toVersion) {
    const versions = Object.values(API_VERSIONS);
    const fromIndex = versions.indexOf(fromVersion);
    const toIndex = versions.indexOf(toVersion);

    if (fromIndex === -1 || toIndex === -1) {
      return [];
    }

    return versions.slice(fromIndex + 1, toIndex + 1);
  },
};
