import fs from 'fs/promises';
import path from 'path';

import { Prisma } from '@generated/prisma/client';
import { AIStatus } from '@generated/prisma/enums';

import { config } from '@/configs';
import { prisma } from '@/shared/libs/prisma.lib';
import { NotFoundError } from '@/shared/utils/error.utils';

export class ForecastService {

    async getById(id: string) {
        try {
            return await prisma.forecast.findFirst({
                where: { id },
            });
        } catch (error) {
            throw new NotFoundError(`[Forecast getById] ${id}`);
        }
    }

    async findAllForDataTable(
        page: number,
        limit: number,
        sortField: string,
        sortDir: string,
        search?: string,
    ) {
        const skip = (page - 1) * limit;
        const where: Prisma.ForecastWhereInput = search
            ? {
                  OR: [
                      { name: { contains: search, mode: 'insensitive' } },
                      { droneName: { contains: search, mode: 'insensitive' } },
                  ],
              }
            : {};

        const [items, total, filterd] = await prisma.$transaction([
            prisma.forecast.findMany({
                where,
                skip,
                take: limit,
                orderBy: {
                    [sortField]: sortDir,
                },
            }),
            prisma.forecast.count(),
            prisma.forecast.count({ where }),
        ]);
        return { items, total, filterd };
    }

    async deleteById(id: string) {
        try {
            const forecast = await prisma.forecast.delete({
                where: { id: id },
            });

            const dir = path.join(config.app.forecastDir, forecast.id);
            await fs.rm(dir, { recursive: true, force: true });
            return forecast;
        } catch (error) {
            console.error(`[FORECAST DELETE]`);
            throw error;
        }
    }
}
