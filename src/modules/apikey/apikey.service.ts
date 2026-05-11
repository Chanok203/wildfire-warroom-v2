import { ApiKey } from '@generated/prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { prisma } from '@/shared/libs/prisma.lib';
import { NotFoundError } from '@/shared/utils/error.utils';

export class ApiKeyService {
    async create(name: string, key: string): Promise<ApiKey> {
        const apikey = await prisma.apiKey.create({
            data: {
                name: name,
                key: key,
            },
        });
        return apikey;
    }

    async getByKey(key: string): Promise<ApiKey> {
        const apikey = await prisma.apiKey.findUnique({ where: { key } });
        if (!apikey) {
            throw new NotFoundError(`ApiKey (${key}) not found`);
        }
        return apikey;
    }

    async delete(key: string): Promise<void> {
        const { id } = await this.getByKey(key);
        await prisma.apiKey.delete({ where: { key: key } });
    }

    async getList(): Promise<ApiKey[]> {
        try {
            return await prisma.apiKey.findMany({
                orderBy: { createdAt: 'desc' },
            });
        } catch (error) {
            return [];
        }
    }
}
