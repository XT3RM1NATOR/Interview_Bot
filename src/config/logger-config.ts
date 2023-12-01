import winston from 'winston';

// Create a logger instance
export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: '../logger/logFile.log' })
  ]
});