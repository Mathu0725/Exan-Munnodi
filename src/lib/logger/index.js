// Only import winston on server side
let winston, DailyRotateFile, path;

if (typeof window === 'undefined') {
  // Server side - import winston
  try {
    winston = require('winston');
    DailyRotateFile = require('winston-daily-rotate-file').default;
    path = require('path');
  } catch (error) {
    // Winston not available, fallback to console
    winston = null;
    DailyRotateFile = null;
    path = null;
  }
} else {
  // Client side - use console fallback
  winston = null;
  DailyRotateFile = null;
  path = null;
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Create logger based on environment
let logger;
let morganStream;

if (typeof window === 'undefined' && winston) {
  // Server side - use winston
  winston.addColors(colors);

  // Define log format
  const format = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(
      info => `${info.timestamp} ${info.level}: ${info.message}`
    )
  );

  // Define transports
  const transports = [
    // Console transport
    new winston.transports.Console({
      level: process.env.NODE_ENV === 'production' ? 'warn' : 'debug',
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      ),
    }),

    // Error log file
    new DailyRotateFile({
      filename: path.join(process.cwd(), 'logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),

    // Combined log file
    new DailyRotateFile({
      filename: path.join(process.cwd(), 'logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),

    // HTTP requests log file
    new DailyRotateFile({
      filename: path.join(process.cwd(), 'logs', 'http-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'http',
      maxSize: '20m',
      maxFiles: '7d',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
      ),
    }),
  ];

  // Create the logger
  logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    levels,
    format,
    transports,
    // Handle uncaught exceptions
    exceptionHandlers: [
      new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'exceptions.log'),
      }),
    ],
    // Handle unhandled promise rejections
    rejectionHandlers: [
      new winston.transports.File({
        filename: path.join(process.cwd(), 'logs', 'rejections.log'),
      }),
    ],
  });

  // Create a stream object for Morgan HTTP logging
  morganStream = {
    write: message => {
      logger.http(message.trim());
    },
  };
} else {
  // Client side - use console fallback
  logger = {
    error: (...args) => console.error('[ERROR]', ...args),
    warn: (...args) => console.warn('[WARN]', ...args),
    info: (...args) => console.info('[INFO]', ...args),
    http: (...args) => console.log('[HTTP]', ...args),
    debug: (...args) => console.log('[DEBUG]', ...args),
  };

  // Create a stream object for Morgan HTTP logging (client fallback)
  morganStream = {
    write: message => {
      logger.http(message.trim());
    },
  };
}

export { morganStream };
export default logger;