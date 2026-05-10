import { ApiKey } from '@generated/prisma/client';
import { v4 as uuidv4 } from 'uuid';

import { prisma } from '@/shared/libs/prisma.lib';
import { NotFoundError } from '@/shared/utils/error.utils';

export class ApiKeyService {
    async create(name: string): Promise<ApiKey> {
        const key = await prisma.apiKey.create({
            data: {
                name: name,
                key: uuidv4(),
            },
        });
        return key;
    }

    async getByKey(key: string): Promise<ApiKey> {
        const apikey = await prisma.apiKey.findUnique({ where: { key } });
        if (!apikey) {
            throw new NotFoundError(`ApiKey (${key}) not found`);
        }
        return apikey;
    }

    async delete(key: string): Promise<void> {
        await this.getByKey(key);
        await prisma.apiKey.delete({ where: { key } });
    }
}
