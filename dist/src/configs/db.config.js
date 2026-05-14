"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dbConfig = void 0;
const env_util_1 = require("../shared/utils/env.util");
const POSTGRES_HOST = '127.0.0.1';
const POSTGRES_PORT = (0, env_util_1.getEnv)('POSTGRES_PORT');
const POSTGRES_USER = (0, env_util_1.getEnv)('POSTGRES_USER');
const POSTGRES_PASSWORD = (0, env_util_1.getEnv)('POSTGRES_PASSWORD');
const POSTGRES_DB = 'warroom';
const DATABASE_URL = `postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT}/${POSTGRES_DB}?schema=public`;
exports.dbConfig = {
    url: DATABASE_URL,
};
//# sourceMappingURL=db.config.js.map