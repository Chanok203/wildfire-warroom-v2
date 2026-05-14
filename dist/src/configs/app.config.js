"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.appConfig = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const env_util_1 = require("../shared/utils/env.util");
const env = (0, env_util_1.getEnv)('NODE_ENV');
exports.appConfig = {
    host: (0, env_util_1.getEnv)('HOST'),
    port: Number((0, env_util_1.getEnv)('PORT')),
    secret: (0, env_util_1.getEnv)('SECRET'),
    isDev: env === 'development',
    isProd: env === 'production',
    forecastDir: path_1.default.resolve(__dirname, '..', '..', 'media', 'forecast'),
};
[
    exports.appConfig.forecastDir,
].forEach((dir) => {
    if (!(0, fs_1.existsSync)(dir)) {
        (0, fs_1.mkdirSync)(dir, { recursive: true });
    }
});
//# sourceMappingURL=app.config.js.map