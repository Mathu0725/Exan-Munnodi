import swaggerJSDoc from 'swagger-jsdoc';
import { API_VERSIONS, VERSION_CONFIG } from './versioning.js';

/**
 * Swagger/OpenAPI configuration
 */

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Exam Munnodi API',
    version: '2.0.0',
    description:
      'A comprehensive exam management system API with advanced security features',
    contact: {
      name: 'API Support',
      email: 'support@exammunnodi.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://api.exammunnodi.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: 'apiKey',
        in: 'cookie',
        name: 'auth_token',
        description: 'JWT token stored in httpOnly cookie',
      },
      csrfToken: {
        type: 'apiKey',
        in: 'header',
        name: 'X-CSRF-Token',
        description: 'CSRF token for state-changing operations',
      },
    },
    schemas: {
      User: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          name: {
            type: 'string',
            example: 'John Doe',
          },
          email: {
            type: 'string',
            format: 'email',
            example: 'john.doe@example.com',
          },
          role: {
            type: 'string',
            enum: ['STUDENT', 'TEACHER', 'ADMIN'],
            example: 'STUDENT',
          },
          status: {
            type: 'string',
            enum: ['Active', 'Pending', 'Inactive', 'Suspended'],
            example: 'Active',
          },
          createdAt: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00Z',
          },
        },
      },
      Question: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          question: {
            type: 'string',
            example: 'What is the capital of France?',
          },
          type: {
            type: 'string',
            enum: ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_BLANK'],
            example: 'MULTIPLE_CHOICE',
          },
          options: {
            type: 'array',
            items: {
              type: 'string',
            },
            example: ['Paris', 'London', 'Berlin', 'Madrid'],
          },
          correctAnswer: {
            type: 'string',
            example: 'Paris',
          },
          difficulty: {
            type: 'string',
            enum: ['EASY', 'MEDIUM', 'HARD'],
            example: 'MEDIUM',
          },
          subjectId: {
            type: 'integer',
            example: 1,
          },
          categoryId: {
            type: 'integer',
            example: 1,
          },
          tags: {
            type: 'array',
            items: {
              type: 'string',
            },
            example: ['geography', 'capitals'],
          },
        },
      },
      Subject: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          name: {
            type: 'string',
            example: 'Mathematics',
          },
          description: {
            type: 'string',
            example: 'Basic mathematics concepts',
          },
          order: {
            type: 'integer',
            example: 1,
          },
        },
      },
      Category: {
        type: 'object',
        properties: {
          id: {
            type: 'integer',
            example: 1,
          },
          name: {
            type: 'string',
            example: 'Algebra',
          },
          description: {
            type: 'string',
            example: 'Algebraic concepts and equations',
          },
          order: {
            type: 'integer',
            example: 1,
          },
        },
      },
      Error: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: false,
          },
          error: {
            type: 'string',
            example: 'Validation failed',
          },
          type: {
            type: 'string',
            example: 'validation_error',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00Z',
          },
        },
      },
      Success: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'object',
          },
          message: {
            type: 'string',
            example: 'Operation successful',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
            example: '2024-01-01T00:00:00Z',
          },
        },
      },
      PaginationMeta: {
        type: 'object',
        properties: {
          currentPage: {
            type: 'integer',
            example: 1,
          },
          totalPages: {
            type: 'integer',
            example: 10,
          },
          total: {
            type: 'integer',
            example: 100,
          },
          pageSize: {
            type: 'integer',
            example: 10,
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Authentication required',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'Authentication required',
              type: 'authentication_error',
              timestamp: '2024-01-01T00:00:00Z',
            },
          },
        },
      },
      ValidationError: {
        description: 'Validation failed',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'email: Invalid email format',
              type: 'validation_error',
              timestamp: '2024-01-01T00:00:00Z',
            },
          },
        },
      },
      RateLimitError: {
        description: 'Rate limit exceeded',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'Too many requests. Please try again shortly.',
              type: 'rate_limit_error',
              timestamp: '2024-01-01T00:00:00Z',
            },
          },
        },
      },
      CSRFError: {
        description: 'CSRF token validation failed',
        content: {
          'application/json': {
            schema: {
              $ref: '#/components/schemas/Error',
            },
            example: {
              success: false,
              error: 'CSRF token validation failed',
              type: 'csrf_error',
              timestamp: '2024-01-01T00:00:00Z',
            },
          },
        },
      },
    },
  },
  security: [
    {
      cookieAuth: [],
    },
  ],
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication and authorization',
    },
    {
      name: 'Questions',
      description: 'Question management operations',
    },
    {
      name: 'Subjects',
      description: 'Subject management operations',
    },
    {
      name: 'Categories',
      description: 'Category management operations',
    },
    {
      name: 'Version',
      description: 'API version information',
    },
  ],
};

const options = {
  definition: swaggerDefinition,
  apis: ['./app/api/**/*.js', './app/api/v2/**/*.js', './src/lib/api/**/*.js'],
};

export const swaggerSpec = swaggerJSDoc(options);

/**
 * Generate API documentation for a specific version
 * @param {string} version - API version
 * @returns {Object} - Swagger specification for the version
 */
export function generateVersionedDocs(version) {
  const versionConfig = VERSION_CONFIG[version];
  if (!versionConfig) {
    throw new Error(`Invalid API version: ${version}`);
  }

  const versionedSpec = {
    ...swaggerDefinition,
    info: {
      ...swaggerDefinition.info,
      version: version,
      description: `${swaggerDefinition.info.description} - Version ${version}`,
    },
    servers: swaggerDefinition.servers.map(server => ({
      ...server,
      url: `${server.url}/api/${version}`,
    })),
  };

  return versionedSpec;
}

/**
 * Get API documentation endpoint
 * @param {Request} request - The request object
 * @returns {Response} - Swagger UI HTML response
 */
export function getSwaggerUI(request) {
  const url = new URL(request.url);
  const version = url.searchParams.get('version') || 'v2';

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Exam Munnodi API Documentation - ${version.toUpperCase()}</title>
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
        <style>
          .swagger-ui .topbar { display: none; }
          .swagger-ui .info .title { color: #3b82f6; }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
        <script>
          const spec = ${JSON.stringify(generateVersionedDocs(version), null, 2)};
          SwaggerUIBundle({
            spec: spec,
            dom_id: '#swagger-ui',
            deepLinking: true,
            presets: [
              SwaggerUIBundle.presets.apis,
              SwaggerUIBundle.presets.standalone
            ],
            plugins: [
              SwaggerUIBundle.plugins.DownloadUrl
            ],
            layout: "StandaloneLayout",
            tryItOutEnabled: true,
            requestInterceptor: (req) => {
              // Add CSRF token if available
              const csrfToken = document.cookie
                .split('; ')
                .find(row => row.startsWith('csrf-token='))
                ?.split('=')[1];
              if (csrfToken) {
                req.headers['X-CSRF-Token'] = csrfToken;
              }
              return req;
            }
          });
        </script>
      </body>
    </html>
  `;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
      'X-API-Version': version,
    },
  });
}

/**
 * Get OpenAPI JSON specification
 * @param {Request} request - The request object
 * @returns {Response} - OpenAPI JSON response
 */
export function getOpenAPISpec(request) {
  const url = new URL(request.url);
  const version = url.searchParams.get('version') || 'v2';

  const spec = generateVersionedDocs(version);

  return new Response(JSON.stringify(spec, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'X-API-Version': version,
    },
  });
}
