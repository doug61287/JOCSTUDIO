import pino from 'pino';
import { env, isDev } from '../config/env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  formatters: {
    level: (label) => ({ level: label.toUpperCase() }),
  },
  base: {
    env: env.NODE_ENV,
  },
});

export function createChildLogger(name: string) {
  return logger.child({ module: name });
}
