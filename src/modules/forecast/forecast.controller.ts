import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

import { pipeline } from 'stream/promises';
import unzipper from 'unzipper';

import { config } from '@/configs';
import { ApiKeyService } from '@/modules/apikey/apikey.service';
import { ForecastService } from '@/modules/forecast/forecast.service';
import { prisma } from '@/shared/libs/prisma.lib';

const entity = 'forecast';

const forecastService = new ForecastService();
const apiKeyService = new ApiKeyService();

export const renderForecastList = async (req: Request, res: Response) => {
    res.render('forecast/forecast-list.html');
};

export const handleForecastDelete = async (req: Request, res: Response) => {
    const { forecastId } = req.params;
    const forecast = await forecastService.deleteById(forecastId as string);
    req.flash(
        'success',
        `คุณลบภารกิจ ${forecast.name} (${forecast.id}) สำเร็จแล้ว`,
    );
    res.redirect(`/forecast`);
};

export const renderView = async (req: Request, res: Response) => {
    const forecastId = (req.query.forecastId as string) || '';
    const qgisUrl = `${config.qgis.url}`;
    res.render('forecast/forecast-view.html', { entity, forecastId, qgisUrl });
};

export const handleUploadForecast = async (req: Request, res: Response) => {
    const file = req.file;

    try {
        const key = req.headers['x-api-key'] as string;
        if (!key) {
            return res.status(400).json({
                status: 'fail',
                data: null,
                message: 'apikey is missing',
            });
        }

        try {
            const apiKey = await apiKeyService.getByKey(key);
        } catch (error) {
            return res.status(403).json({
                status: 'fail',
                data: null,
                message: 'invalid apikey',
            });
        }

        if (!file) {
            throw new Error(`No file uploaded`);
        }

        const forecastId = path.parse(file.originalname).name;
        const extractPath = path.join(config.app.forecastDir, forecastId);

        await new Promise<void>((resolve, reject) => {
            fs.createReadStream(file.path)
                .pipe(unzipper.Extract({ path: extractPath }))
                .on('finish', resolve)
                .on('error', reject);
        });
        console.log('Extract done, checking files...');
        const extracted = fs.readdirSync(extractPath, { recursive: true });
        console.log('Extracted files:', extracted);

        const inputData = JSON.parse(
            fs.readFileSync(
                path.join(extractPath, 'input', 'detection-response.json'),
                'utf-8',
            ),
        );

        await prisma.forecast.upsert({
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
                startTime: new Date(inputData.startTime),
            },
        });

        const jsonPath = path.join(extractPath, 'output', 'result.json');
        if (fs.existsSync(jsonPath)) {
            const geojson = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

            if (geojson && Array.isArray(geojson) && geojson.length > 0) {
                const results = geojson.map((item: any) => {
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
                await prisma.$transaction([
                    prisma.forecastResult.deleteMany({
                        where: { forecastId: forecastId },
                    }),
                    prisma.forecastResult.createMany({
                        data: results,
                    }),
                    prisma.forecast.update({
                        where: { id: forecastId },
                        data: {
                            createdAt: firstValidAt, // นำค่าจากผลลัพธ์ตัวแรกมาใส่
                            aiStatus: 'COMPLETED', // อัปเดตสถานะไปพร้อมกันเลย
                            pushStatus: 'PUSHED',
                        },
                    }),
                ]);

                console.log(
                    `[DB] Saved ${results.length} results for ${forecastId}`,
                );
            }
        }

        fs.unlinkSync(file.path);
        res.status(200).json({
            status: 'success',
            data: null,
            message: null,
        });
    } catch (error) {
        if (file && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }
        console.log(error);

        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
    }
};
