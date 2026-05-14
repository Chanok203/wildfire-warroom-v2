"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ForecastService = void 0;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const configs_1 = require("../../configs");
const prisma_lib_1 = require("../../shared/libs/prisma.lib");
const error_utils_1 = require("../../shared/utils/error.utils");
class ForecastService {
    async getById(id) {
        try {
            return await prisma_lib_1.prisma.forecast.findFirst({
                where: { id },
            });
        }
        catch (error) {
            throw new error_utils_1.NotFoundError(`[Forecast getById] ${id}`);
        }
    }
    async findAllForDataTable(page, limit, sortField, sortDir, search) {
        const skip = (page - 1) * limit;
        const where = search
            ? {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { droneName: { contains: search, mode: 'insensitive' } },
                ],
            }
            : {};
        const [items, total, filterd] = await prisma_lib_1.prisma.$transaction([
            prisma_lib_1.prisma.forecast.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortField]: sortDir,
                },
            }),
            prisma_lib_1.prisma.forecast.count(),
            prisma_lib_1.prisma.forecast.count({ where }),
        ]);
        return { items, total, filterd };
    }
    async deleteById(id) {
        try {
            const forecast = await prisma_lib_1.prisma.forecast.delete({
                where: { id: id },
            });
            const dir = path_1.default.join(configs_1.config.app.forecastDir, forecast.id);
            await promises_1.default.rm(dir, { recursive: true, force: true });
            return forecast;
        }
        catch (error) {
            console.error(`[FORECAST DELETE]`);
            throw error;
        }
    }
}
exports.ForecastService = ForecastService;
//# sourceMappingURL=forecast.service.js.map