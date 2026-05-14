"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const bcrypt = __importStar(require("bcrypt"));
const prisma_lib_1 = require("../../shared/libs/prisma.lib");
const error_utils_1 = require("../../shared/utils/error.utils");
class UserService {
    SALT_ROUNDS = 10;
    async hashPassword(password) {
        return await bcrypt.hash(password, this.SALT_ROUNDS);
    }
    async verifyPassword(password, hashed) {
        return await bcrypt.compare(password, hashed);
    }
    async create(username, password) {
        const dup = await this.findByUsername(username);
        if (dup) {
            throw new error_utils_1.BadRequestError(`Username "${username}" is already taken`);
        }
        const user = await prisma_lib_1.prisma.user.create({
            data: {
                username: username,
                password: await this.hashPassword(password),
            },
        });
        return user;
    }
    async setPassword(id, password) {
        await this.getById(id);
        const updated = await prisma_lib_1.prisma.user.update({
            where: { id },
            data: {
                password: await this.hashPassword(password),
            },
        });
        return updated;
    }
    async findById(id) {
        const user = await prisma_lib_1.prisma.user.findUnique({ where: { id } });
        return user;
    }
    async findByUsername(username) {
        const user = await prisma_lib_1.prisma.user.findUnique({ where: { username } });
        return user;
    }
    async getById(id) {
        const user = await this.findById(id);
        if (!user) {
            throw new error_utils_1.NotFoundError(`User with id=${id} not found`);
        }
        return user;
    }
    async getByUsername(username) {
        const user = await this.findByUsername(username);
        if (!user) {
            throw new error_utils_1.NotFoundError(`User with username=${username} not found`);
        }
        return user;
    }
    async deleteById(id) {
        await this.getById(id);
        await prisma_lib_1.prisma.user.delete({ where: { id } });
    }
    async getList() {
        try {
            const users = await prisma_lib_1.prisma.user.findMany({
                orderBy: { createdAt: 'desc' },
            });
            return users;
        }
        catch (error) {
            return [];
        }
    }
}
exports.UserService = UserService;
//# sourceMappingURL=users.service.js.map