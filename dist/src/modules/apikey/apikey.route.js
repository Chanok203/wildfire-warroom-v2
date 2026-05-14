"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiKeyRouter = void 0;
const apikey_controller_1 = require("../../modules/apikey/apikey.controller");
const express_1 = require("express");
const router = (0, express_1.Router)();
exports.apiKeyRouter = router;
router.get("/", apikey_controller_1.renderApiKeyList);
router.post("/create", apikey_controller_1.handleCreateApiKey);
router.post("/delete", apikey_controller_1.handleDeleteApiKey);
//# sourceMappingURL=apikey.route.js.map