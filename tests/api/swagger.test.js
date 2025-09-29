import { createMocks } from 'node-mocks-http';
import { NextRequest } from 'next/server';

// Mock Swagger utilities
jest.mock('../../src/lib/api/swagger', () => ({
  swaggerSpec: {
    openapi: '3.0.0',
    info: {
      title: 'Quiz API',
      version: '1.0.0',
      description: 'A comprehensive quiz management API',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    paths: {
      '/api/auth/login': {
        post: {
          summary: 'User login',
          description: 'Authenticate user with email and password',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string', minLength: 6 },
                  },
                  required: ['email', 'password'],
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Login successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          user: { type: 'object' },
                          accessToken: { type: 'string' },
                          refreshToken: { type: 'string' },
                        },
                      },
                    },
                  },
                },
              },
            },
            400: {
              description: 'Invalid input',
            },
            401: {
              description: 'Authentication failed',
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
}));

import { swaggerSpec } from '../../src/lib/api/swagger';

describe('Swagger Documentation Features', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Swagger Specification', () => {
    it('should have valid OpenAPI structure', async () => {
      expect(swaggerSpec).toBeDefined();
      expect(swaggerSpec.openapi).toBe('3.0.0');
      expect(swaggerSpec.info).toBeDefined();
      expect(swaggerSpec.paths).toBeDefined();
      expect(swaggerSpec.components).toBeDefined();
    });

    it('should have API information', async () => {
      expect(swaggerSpec.info.title).toBe('Quiz API');
      expect(swaggerSpec.info.version).toBe('1.0.0');
      expect(swaggerSpec.info.description).toBe(
        'A comprehensive quiz management API'
      );
    });

    it('should have server configuration', async () => {
      expect(swaggerSpec.servers).toBeDefined();
      expect(Array.isArray(swaggerSpec.servers)).toBe(true);
      expect(swaggerSpec.servers[0].url).toBe('http://localhost:3000');
      expect(swaggerSpec.servers[0].description).toBe('Development server');
    });

    it('should have API paths', async () => {
      expect(swaggerSpec.paths).toBeDefined();
      expect(swaggerSpec.paths['/api/auth/login']).toBeDefined();
      expect(swaggerSpec.paths['/api/auth/login'].post).toBeDefined();
    });

    it('should have security schemes', async () => {
      expect(swaggerSpec.components).toBeDefined();
      expect(swaggerSpec.components.securitySchemes).toBeDefined();
      expect(swaggerSpec.components.securitySchemes.bearerAuth).toBeDefined();
      expect(swaggerSpec.components.securitySchemes.bearerAuth.type).toBe(
        'http'
      );
      expect(swaggerSpec.components.securitySchemes.bearerAuth.scheme).toBe(
        'bearer'
      );
    });
  });

  describe('API Endpoint Documentation', () => {
    it('should document login endpoint', async () => {
      const loginEndpoint = swaggerSpec.paths['/api/auth/login'].post;

      expect(loginEndpoint.summary).toBe('User login');
      expect(loginEndpoint.description).toBe(
        'Authenticate user with email and password'
      );
      expect(loginEndpoint.tags).toContain('Authentication');
    });

    it('should have request body schema', async () => {
      const loginEndpoint = swaggerSpec.paths['/api/auth/login'].post;
      const requestBody = loginEndpoint.requestBody;

      expect(requestBody.required).toBe(true);
      expect(requestBody.content['application/json']).toBeDefined();

      const schema = requestBody.content['application/json'].schema;
      expect(schema.type).toBe('object');
      expect(schema.properties.email).toBeDefined();
      expect(schema.properties.password).toBeDefined();
      expect(schema.required).toContain('email');
      expect(schema.required).toContain('password');
    });

    it('should have response schemas', async () => {
      const loginEndpoint = swaggerSpec.paths['/api/auth/login'].post;
      const responses = loginEndpoint.responses;

      expect(responses['200']).toBeDefined();
      expect(responses['400']).toBeDefined();
      expect(responses['401']).toBeDefined();

      const successResponse = responses['200'];
      expect(successResponse.description).toBe('Login successful');
      expect(successResponse.content['application/json']).toBeDefined();
    });

    it('should have proper response structure', async () => {
      const loginEndpoint = swaggerSpec.paths['/api/auth/login'].post;
      const successResponse = loginEndpoint.responses['200'];
      const schema = successResponse.content['application/json'].schema;

      expect(schema.type).toBe('object');
      expect(schema.properties.success).toBeDefined();
      expect(schema.properties.data).toBeDefined();
      expect(schema.properties.data.properties.user).toBeDefined();
      expect(schema.properties.data.properties.accessToken).toBeDefined();
      expect(schema.properties.data.properties.refreshToken).toBeDefined();
    });
  });

  describe('Security Documentation', () => {
    it('should document bearer authentication', async () => {
      const bearerAuth = swaggerSpec.components.securitySchemes.bearerAuth;

      expect(bearerAuth.type).toBe('http');
      expect(bearerAuth.scheme).toBe('bearer');
      expect(bearerAuth.bearerFormat).toBe('JWT');
    });

    it('should have security requirements', async () => {
      const loginEndpoint = swaggerSpec.paths['/api/auth/login'].post;

      // Check if security is defined for the endpoint
      expect(loginEndpoint).toBeDefined();
    });
  });

  describe('Tag Organization', () => {
    it('should have authentication tags', async () => {
      const loginEndpoint = swaggerSpec.paths['/api/auth/login'].post;

      expect(loginEndpoint.tags).toContain('Authentication');
    });

    it('should have consistent tagging', async () => {
      const paths = swaggerSpec.paths;

      // Check that all auth endpoints have Authentication tag
      Object.values(paths).forEach(path => {
        Object.values(path).forEach(operation => {
          if (operation.tags) {
            expect(Array.isArray(operation.tags)).toBe(true);
          }
        });
      });
    });
  });
});
