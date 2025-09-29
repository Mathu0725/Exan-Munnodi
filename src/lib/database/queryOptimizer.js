import logger from '@/lib/logger';

/**
 * Database query optimization utilities
 */

/**
 * Query optimization strategies
 */
export const OPTIMIZATION_STRATEGIES = {
  INDEXING: 'indexing',
  QUERY_STRUCTURE: 'query_structure',
  CACHING: 'caching',
  BATCHING: 'batching',
  PAGINATION: 'pagination',
  SELECT_OPTIMIZATION: 'select_optimization',
};

/**
 * Common query patterns and their optimizations
 */
const QUERY_PATTERNS = {
  // N+1 Query Problem
  N_PLUS_ONE: {
    pattern: /\.findMany\(\)[\s\S]*?\.findUnique\(/g,
    solution: 'Use include or select to fetch related data in a single query',
    example: `
      // Bad: N+1 queries
      const users = await prisma.user.findMany();
      for (const user of users) {
        const profile = await prisma.profile.findUnique({ where: { userId: user.id } });
      }
      
      // Good: Single query with include
      const users = await prisma.user.findMany({
        include: { profile: true }
      });
    `,
  },

  // Missing Index
  MISSING_INDEX: {
    pattern: /\.findMany\(\s*\{\s*where:\s*\{[^}]*\}\s*\}\s*\)/g,
    solution: 'Add database indexes for frequently queried fields',
    example: `
      // Add index in schema.prisma
      model User {
        email String @unique
        status String
        
        @@index([status])
        @@index([email, status])
      }
    `,
  },

  // Unnecessary Data Fetching
  UNNECESSARY_SELECT: {
    pattern: /\.findMany\(\s*\{\s*include:\s*\{[^}]*\}\s*\}\s*\)/g,
    solution: 'Use select to fetch only required fields',
    example: `
      // Bad: Fetching all fields
      const users = await prisma.user.findMany({
        include: { profile: true }
      });
      
      // Good: Select only needed fields
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          profile: {
            select: {
              bio: true
            }
          }
        }
      });
    `,
  },
};

/**
 * Query optimization analyzer
 */
export class QueryOptimizer {
  constructor() {
    this.queryHistory = new Map();
    this.optimizationSuggestions = new Map();
  }

  /**
   * Analyze a query for optimization opportunities
   * @param {string} query - The query to analyze
   * @param {Object} context - Query context
   * @returns {Object} - Optimization analysis
   */
  analyzeQuery(query, context = {}) {
    const analysis = {
      query,
      context,
      optimizations: [],
      performance: {
        estimatedCost: 'low',
        complexity: 'simple',
      },
      suggestions: [],
    };

    // Check for common patterns
    for (const [patternName, pattern] of Object.entries(QUERY_PATTERNS)) {
      if (pattern.pattern.test(query)) {
        analysis.optimizations.push({
          type: patternName,
          solution: pattern.solution,
          example: pattern.example,
          priority: 'high',
        });
      }
    }

    // Analyze query structure
    this.analyzeQueryStructure(query, analysis);

    // Analyze performance implications
    this.analyzePerformance(query, analysis);

    // Generate suggestions
    this.generateSuggestions(query, analysis);

    return analysis;
  }

  /**
   * Analyze query structure
   * @param {string} query - The query
   * @param {Object} analysis - Analysis object
   */
  analyzeQueryStructure(query, analysis) {
    // Check for complex joins
    const joinCount = (query.match(/JOIN/gi) || []).length;
    if (joinCount > 3) {
      analysis.optimizations.push({
        type: 'complex_joins',
        solution: 'Consider breaking down complex joins or using views',
        priority: 'medium',
      });
    }

    // Check for subqueries
    const subqueryCount = (query.match(/\(SELECT/gi) || []).length;
    if (subqueryCount > 2) {
      analysis.optimizations.push({
        type: 'complex_subqueries',
        solution: 'Consider using CTEs or breaking down subqueries',
        priority: 'medium',
      });
    }

    // Check for wildcard selects
    if (query.includes('SELECT *')) {
      analysis.optimizations.push({
        type: 'wildcard_select',
        solution: 'Specify only required columns instead of using SELECT *',
        priority: 'high',
      });
    }
  }

  /**
   * Analyze performance implications
   * @param {string} query - The query
   * @param {Object} analysis - Analysis object
   */
  analyzePerformance(query, analysis) {
    // Estimate query complexity
    const complexity = this.estimateQueryComplexity(query);
    analysis.performance.complexity = complexity;

    // Estimate cost
    const cost = this.estimateQueryCost(query);
    analysis.performance.estimatedCost = cost;

    // Check for potential performance issues
    if (complexity === 'high' || cost === 'high') {
      analysis.optimizations.push({
        type: 'performance_concern',
        solution: 'Query may have performance issues, consider optimization',
        priority: 'high',
      });
    }
  }

  /**
   * Estimate query complexity
   * @param {string} query - The query
   * @returns {string} - Complexity level
   */
  estimateQueryComplexity(query) {
    const complexity = query.length;
    const joinCount = (query.match(/JOIN/gi) || []).length;
    const subqueryCount = (query.match(/\(SELECT/gi) || []).length;

    const score = complexity + joinCount * 100 + subqueryCount * 50;

    if (score > 1000) return 'high';
    if (score > 500) return 'medium';
    return 'simple';
  }

  /**
   * Estimate query cost
   * @param {string} query - The query
   * @returns {string} - Cost level
   */
  estimateQueryCost(query) {
    const hasOrderBy = query.includes('ORDER BY');
    const hasGroupBy = query.includes('GROUP BY');
    const hasDistinct = query.includes('DISTINCT');
    const hasAggregates = /COUNT|SUM|AVG|MIN|MAX/.test(query);

    let cost = 0;
    if (hasOrderBy) cost += 1;
    if (hasGroupBy) cost += 2;
    if (hasDistinct) cost += 1;
    if (hasAggregates) cost += 2;

    if (cost >= 4) return 'high';
    if (cost >= 2) return 'medium';
    return 'low';
  }

  /**
   * Generate optimization suggestions
   * @param {string} query - The query
   * @param {Object} analysis - Analysis object
   */
  generateSuggestions(query, analysis) {
    const suggestions = [];

    // Index suggestions
    if (query.includes('WHERE')) {
      suggestions.push({
        type: OPTIMIZATION_STRATEGIES.INDEXING,
        message: 'Consider adding indexes for WHERE clause columns',
        priority: 'high',
      });
    }

    // Pagination suggestions
    if (
      query.includes('findMany') &&
      !query.includes('skip') &&
      !query.includes('take')
    ) {
      suggestions.push({
        type: OPTIMIZATION_STRATEGIES.PAGINATION,
        message: 'Consider adding pagination for large result sets',
        priority: 'medium',
      });
    }

    // Caching suggestions
    if (query.includes('findUnique') || query.includes('findFirst')) {
      suggestions.push({
        type: OPTIMIZATION_STRATEGIES.CACHING,
        message: 'Consider caching frequently accessed data',
        priority: 'low',
      });
    }

    analysis.suggestions = suggestions;
  }

  /**
   * Get optimization recommendations
   * @param {string} query - The query
   * @returns {Array} - Optimization recommendations
   */
  getRecommendations(query) {
    const analysis = this.analyzeQuery(query);
    return analysis.optimizations.concat(analysis.suggestions);
  }

  /**
   * Log query optimization suggestions
   * @param {string} query - The query
   * @param {Object} context - Query context
   */
  logOptimizationSuggestions(query, context = {}) {
    const recommendations = this.getRecommendations(query);

    if (recommendations.length > 0) {
      logger.info('Query optimization suggestions', {
        query: query.substring(0, 200) + '...',
        context,
        recommendations: recommendations.map(rec => ({
          type: rec.type,
          solution: rec.solution,
          priority: rec.priority,
        })),
      });
    }
  }
}

/**
 * Create query optimizer instance
 * @returns {QueryOptimizer} - Query optimizer instance
 */
export function createQueryOptimizer() {
  return new QueryOptimizer();
}

/**
 * Database indexing utilities
 */
export const IndexOptimizer = {
  /**
   * Generate index recommendations based on query patterns
   * @param {Array} queries - Array of queries
   * @returns {Array} - Index recommendations
   */
  generateIndexRecommendations(queries) {
    const recommendations = [];
    const fieldUsage = new Map();

    queries.forEach(query => {
      // Extract WHERE clauses
      const whereMatches = query.match(/where:\s*\{([^}]+)\}/g);
      if (whereMatches) {
        whereMatches.forEach(match => {
          const fields = match.match(/(\w+):/g);
          if (fields) {
            fields.forEach(field => {
              const fieldName = field.replace(':', '');
              fieldUsage.set(fieldName, (fieldUsage.get(fieldName) || 0) + 1);
            });
          }
        });
      }
    });

    // Generate recommendations for frequently used fields
    fieldUsage.forEach((count, field) => {
      if (count > 5) {
        recommendations.push({
          field,
          usage: count,
          priority: count > 20 ? 'high' : 'medium',
          suggestion: `Add index for ${field} (used ${count} times)`,
        });
      }
    });

    return recommendations;
  },

  /**
   * Generate composite index recommendations
   * @param {Array} queries - Array of queries
   * @returns {Array} - Composite index recommendations
   */
  generateCompositeIndexRecommendations(queries) {
    const fieldCombinations = new Map();

    queries.forEach(query => {
      const whereMatches = query.match(/where:\s*\{([^}]+)\}/g);
      if (whereMatches) {
        whereMatches.forEach(match => {
          const fields = match.match(/(\w+):/g);
          if (fields && fields.length > 1) {
            const combination = fields
              .map(f => f.replace(':', ''))
              .sort()
              .join(',');
            fieldCombinations.set(
              combination,
              (fieldCombinations.get(combination) || 0) + 1
            );
          }
        });
      }
    });

    const recommendations = [];
    fieldCombinations.forEach((count, combination) => {
      if (count > 3) {
        recommendations.push({
          fields: combination.split(','),
          usage: count,
          priority: count > 10 ? 'high' : 'medium',
          suggestion: `Add composite index for (${combination}) (used ${count} times)`,
        });
      }
    });

    return recommendations;
  },
};

/**
 * Query caching utilities
 */
export const QueryCache = {
  cache: new Map(),
  defaultTTL: 300000, // 5 minutes

  /**
   * Generate cache key for query
   * @param {string} query - The query
   * @param {Object} params - Query parameters
   * @returns {string} - Cache key
   */
  generateCacheKey(query, params = {}) {
    const key = JSON.stringify({ query, params });
    return Buffer.from(key).toString('base64');
  },

  /**
   * Get cached result
   * @param {string} key - Cache key
   * @returns {any} - Cached result or null
   */
  get(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() < cached.expires) {
      return cached.data;
    }
    this.cache.delete(key);
    return null;
  },

  /**
   * Set cached result
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   * @param {number} ttl - Time to live in milliseconds
   */
  set(key, data, ttl = this.defaultTTL) {
    this.cache.set(key, {
      data,
      expires: Date.now() + ttl,
    });
  },

  /**
   * Clear cache
   */
  clear() {
    this.cache.clear();
  },

  /**
   * Get cache statistics
   * @returns {Object} - Cache statistics
   */
  getStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    this.cache.forEach(entry => {
      if (now < entry.expires) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    });

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      hitRate: 0, // Would need to track hits/misses
    };
  },
};

// Export singleton instances
export const queryOptimizer = createQueryOptimizer();
export const queryCache = QueryCache;
