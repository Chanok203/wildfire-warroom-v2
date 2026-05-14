"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const app_config_1 = require("../configs/app.config");
const db_config_1 = require("../configs/db.config");
const qgis_config_1 = require("../configs/qgis.config");
const redis_config_1 = require("../configs/redis.config");
exports.config = {
    app: app_config_1.appConfig,
    db: db_config_1.dbConfig,
    redis: redis_config_1.redisConfig,
    qgis: qgis_config_1.qgisConfig,
};
//# sourceMappingURL=index.js.map