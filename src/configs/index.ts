import { appConfig } from '@/configs/app.config';
import { dbConfig } from '@/configs/db.config';
import { qgisConfig } from '@/configs/qgis.config';
import { redisConfig } from '@/configs/redis.config';

export const config = {
    app: appConfig,
    db: dbConfig,
    redis: redisConfig,
    qgis: qgisConfig,
} as const;
