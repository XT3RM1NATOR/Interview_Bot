import { logger } from '../config/logger-config';

export const logAction = (username:string, action: string) => {
  logger.info(`${username}: ${action}`);
};