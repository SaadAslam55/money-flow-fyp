export { appConfig } from './app.config';
export { databaseConfig } from './database.config';
export { authConfig } from './auth.config';
export { redisConfig } from './redis.config';

// Import for array export
import { appConfig } from './app.config';
import { databaseConfig } from './database.config';
import { authConfig } from './auth.config';
import { redisConfig } from './redis.config';

export const configurations = [appConfig, databaseConfig, authConfig, redisConfig];
