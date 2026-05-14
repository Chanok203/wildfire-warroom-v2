"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDeleteApiKey = exports.handleCreateApiKey = exports.renderApiKeyList = void 0;
const apikey_service_1 = require("../../modules/apikey/apikey.service");
const entity = 'apikey';
const apiKeyService = new apikey_service_1.ApiKeyService();
const renderApiKeyList = async (req, res) => {
    const apiKeyList = await apiKeyService.getList();
    res.render('apikey/apikey-list.html', { entity, apiKeyList });
};
exports.renderApiKeyList = renderApiKeyList;
const handleCreateApiKey = async (req, res) => {
    const { name, key } = req.body;
    try {
        const apikey = await apiKeyService.create(name, key);
        req.flash('success', 'สร้าง API Key สำเร็จแล้ว');
        return res.redirect('/apikey');
    }
    catch (error) {
        req.flash('danger', 'สร้าง API Key ไม่สำเร็จ');
        return res.redirect('/apikey');
    }
};
exports.handleCreateApiKey = handleCreateApiKey;
const handleDeleteApiKey = async (req, res) => {
    const { key } = req.body;
    try {
        const apikey = await apiKeyService.delete(key);
        req.flash('success', 'ลบ API Key สำเร็จแล้ว');
        return res.redirect('/apikey');
    }
    catch (error) {
        console.log(error);
        req.flash('danger', 'ลบ API Key ไม่สำเร็จ');
        return res.redirect('/apikey');
    }
};
exports.handleDeleteApiKey = handleDeleteApiKey;
//# sourceMappingURL=apikey.controller.js.map