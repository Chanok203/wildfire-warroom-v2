"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.qgisConfig = void 0;
const env_util_1 = require("../shared/utils/env.util");
exports.qgisConfig = {
    url: (0, env_util_1.getEnv)('QGIS_URL'),
};
//# sourceMappingURL=qgis.config.js.map