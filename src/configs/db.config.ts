import { getEnv } from '@/shared/utils/env.util';

const POSTGRES_HOST = '127.0.0.1';
const POSTGRES_PORT = getEnv('POSTGRES_PORT');
const POSTGRES_USER = getEnv('POSTGRES_USER');
const POSTGRES_PASSWORD = getEnv('POSTGRES_PASSWORD');
const POSTGRES_DB = 'warroom';

const DATABASE_URL = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public`;

export const dbConfig = {
    url: DATABASE_URL,
} as const;
