"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getForecastForMap = exports.getForecastList = exports.getForcast = void 0;
const forecast_service_1 = require("../../modules/forecast/forecast.service");
const forecastService = new forecast_service_1.ForecastService();
const getForcast = async (req, res) => {
    const forecastId = req.params.forecastId;
    try {
        const forecast = await forecastService.getById(forecastId);
        if (!forecast) {
            return res.status(404).json({
                status: 'fail',
                data: 'Not Found',
            });
        }
        res.json({
            status: 'success',
            data: { forecast },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
    }
};
exports.getForcast = getForcast;
const getForecastList = async (req, res) => {
    const { draw, start, length, search, order, columns } = req.body;
    const sortColumnIndex = order?.[0]?.column;
    const sortDir = order?.[0]?.dir;
    const sortField = columns?.[sortColumnIndex]?.data || 'createdAt';
    const limit = Number(length) || 10;
    const page = Number(start) / limit + 1;
    const { items, total, filterd } = await forecastService.findAllForDataTable(page, limit, sortField, sortDir, search.value);
    res.json({
        draw: Number(draw),
        recordsTotal: total,
        recordsFiltered: filterd,
        data: items,
    });
};
exports.getForecastList = getForecastList;
const getForecastForMap = async (req, res) => {
    const forecastId = req.params.forecastId;
    try {
        const forecast = await forecastService.getById(forecastId);
        if (!forecast) {
            return res.status(404).json({
                status: 'fail',
                data: 'Not Found',
            });
        }
        const { inputData, ...data } = forecast;
        res.json({
            status: 'success',
            data: { forecast: data },
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
    }
};
exports.getForecastForMap = getForecastForMap;
//# sourceMappingURL=forecast.api-controller.js.map