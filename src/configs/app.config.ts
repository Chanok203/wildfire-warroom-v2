import { existsSync, mkdirSync } from 'fs';
import path from 'path';

import { getEnv } from '@/shared/utils/env.util';

const env = getEnv('NODE_ENV');

export const appConfig = {
    host: getEnv('HOST'),
    port: Number(getEnv('PORT')),
    secret: getEnv('SECRET'),
    isDev: env === 'development',
    isProd: env === 'production',
    forecastDir: path.resolve(__dirname, '..', '..', 'media', 'forecast'),
} as const;

[
    appConfig.forecastDir,
].forEach((dir) => {
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
});
