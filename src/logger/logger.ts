import { logger } from '../config/logger-config';

export const logAction = (username: string, action: string) => {
  const currentTime = new Date().toLocaleString(); // Get current time
  logger.info(`${currentTime} - ${username}: ${action}`); // Log with timestamp
};