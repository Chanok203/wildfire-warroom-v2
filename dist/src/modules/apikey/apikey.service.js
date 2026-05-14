"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyService = void 0;
const prisma_lib_1 = require("../../shared/libs/prisma.lib");
const error_utils_1 = require("../../shared/utils/error.utils");
class ApiKeyService {
    async create(name, key) {
        const apikey = await prisma_lib_1.prisma.apiKey.create({
            data: {
                name: name,
                key: key,
            },
        });
        return apikey;
    }
    async getByKey(key) {
        const apikey = await prisma_lib_1.prisma.apiKey.findUnique({ where: { key } });
        if (!apikey) {
            throw new error_utils_1.NotFoundError(`ApiKey (${key}) not found`);
        }
        return apikey;
    }
    async delete(key) {
        const { id } = await this.getByKey(key);
        await prisma_lib_1.prisma.apiKey.delete({ where: { key: key } });
    }
    async getList() {
        try {
            return await prisma_lib_1.prisma.apiKey.findMany({
                orderBy: { createdAt: 'desc' },
            });
        }
        catch (error) {
            return [];
        }
    }
}
exports.ApiKeyService = ApiKeyService;
//# sourceMappingURL=apikey.service.js.map