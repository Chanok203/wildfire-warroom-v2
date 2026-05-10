import { getEnv } from '@/shared/utils/env.util';

export const qgisConfig = {
    url: getEnv('QGIS_URL'),
} as const;
