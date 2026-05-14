"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleUploadForecast = exports.renderView = exports.handleForecastDelete = exports.renderForecastList = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const unzipper_1 = __importDefault(require("unzipper"));
const configs_1 = require("../../configs");
const apikey_service_1 = require("../../modules/apikey/apikey.service");
const forecast_service_1 = require("../../modules/forecast/forecast.service");
const prisma_lib_1 = require("../../shared/libs/prisma.lib");
const entity = 'forecast';
const forecastService = new forecast_service_1.ForecastService();
const apiKeyService = new apikey_service_1.ApiKeyService();
const renderForecastList = async (req, res) => {
    res.render('forecast/forecast-list.html');
};
exports.renderForecastList = renderForecastList;
const handleForecastDelete = async (req, res) => {
    const { forecastId } = req.params;
    const forecast = await forecastService.deleteById(forecastId);
    req.flash('success', `คุณลบภารกิจ ${forecast.name} (${forecast.id}) สำเร็จแล้ว`);
    res.redirect(`/forecast`);
};
exports.handleForecastDelete = handleForecastDelete;
const renderView = async (req, res) => {
    const forecastId = req.query.forecastId || '';
    const qgisUrl = `${configs_1.config.qgis.url}`;
    res.render('forecast/forecast-view.html', { entity, forecastId, qgisUrl });
};
exports.renderView = renderView;
const handleUploadForecast = async (req, res) => {
    const file = req.file;
    try {
        const key = req.headers['x-api-key'];
        if (!key) {
            throw new Error('API Key is missing');
        }
        const apiKey = await apiKeyService.getByKey(key);
        if (!file) {
            throw new Error(`No file uploaded`);
        }
        const forecastId = path_1.default.parse(file.originalname).name;
        const extractPath = path_1.default.join(configs_1.config.app.forecastDir, forecastId);
        await fs_1.default
            .createReadStream(file.path)
            .pipe(unzipper_1.default.Extract({ path: extractPath }))
            .promise();
        const inputData = JSON.parse(fs_1.default.readFileSync(path_1.default.join(extractPath, 'input', 'detection-response.json'), 'utf-8'));
        await prisma_lib_1.prisma.forecast.upsert({
            where: { id: forecastId },
            update: {
                aiStatus: 'COMPLETED',
                pushStatus: 'PUSHED',
            },
            create: {
                id: forecastId,
                name: inputData.forecastName,
                droneName: inputData.droneId,
                aiStatus: 'COMPLETED',
                pushStatus: 'PUSHED',
                latitude: inputData.latitude,
                longitude: inputData.longitude,
            },
        });
        const jsonPath = path_1.default.join(extractPath, 'output', 'result.json');
        if (fs_1.default.existsSync(jsonPath)) {
            const geojson = JSON.parse(fs_1.default.readFileSync(jsonPath, 'utf-8'));
            if (geojson && Array.isArray(geojson) && geojson.length > 0) {
                const results = geojson.map((item) => {
                    const match = item.filename.match(/_(\d+)min/);
                    const minutes = match ? Number(match[1]) : 0;
                    return {
                        forecastId: forecastId,
                        filename: item.filename,
                        minutes: minutes,
                        validAt: item.geojson.valid_at,
                        geojsonData: {
                            geometry: item.geojson.features[0].geometry,
                        },
                    };
                });
                // 3. ใช้ Transaction เพื่อลบข้อมูลเก่าและเพิ่มข้อมูลใหม่
                const firstValidAt = results[0].validAt;
                await prisma_lib_1.prisma.$transaction([
                    prisma_lib_1.prisma.forecastResult.deleteMany({
                        where: { forecastId: forecastId },
                    }),
                    prisma_lib_1.prisma.forecastResult.createMany({
                        data: results,
                    }),
                    prisma_lib_1.prisma.forecast.update({
                        where: { id: forecastId },
                        data: {
                            createdAt: firstValidAt, // นำค่าจากผลลัพธ์ตัวแรกมาใส่
                            aiStatus: 'COMPLETED', // อัปเดตสถานะไปพร้อมกันเลย
                            pushStatus: 'PUSHED',
                        },
                    }),
                ]);
                console.log(`[DB] Saved ${results.length} results for ${forecastId}`);
            }
        }
        fs_1.default.unlinkSync(file.path);
        res.status(200).json({
            status: 'success',
            data: null,
            message: null,
        });
    }
    catch (error) {
        if (file && fs_1.default.existsSync(file.path)) {
            fs_1.default.unlinkSync(file.path);
        }
        console.log(error);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
    }
};
exports.handleUploadForecast = handleUploadForecast;
//# sourceMappingURL=forecast.controller.js.map