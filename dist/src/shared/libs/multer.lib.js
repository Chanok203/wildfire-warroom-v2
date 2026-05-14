"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const configs_1 = require("../../configs");
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        cb(null, configs_1.config.app.forecastDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1024,
    },
});
//# sourceMappingURL=multer.lib.js.map