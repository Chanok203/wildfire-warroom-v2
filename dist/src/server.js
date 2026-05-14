"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const configs_1 = require("./configs");
const httpServer = http_1.default.createServer(app_1.app);
const { port, host } = configs_1.config.app;
httpServer.listen(port, host, () => {
    console.log(`Server is running at http://${host}:${port}`);
});
//# sourceMappingURL=server.js.map