import { Request, Response } from 'express';

import { ForecastService } from '@/modules/forecast/forecast.service';

const forecastService = new ForecastService();

export const getForcast = async (req: Request, res: Response) => {
    const forecastId = req.params.forecastId as string;
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
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
    }
};

export const getForecastList = async (req: Request, res: Response) => {
    const { draw, start, length, search, order, columns } = req.body;

    const sortColumnIndex = order?.[0]?.column;
    const sortDir = order?.[0]?.dir;

    const sortField = columns?.[sortColumnIndex]?.data || 'createdAt';

    const limit = Number(length) || 10;
    const page = Number(start) / limit + 1;

    const { items, total, filterd } = await forecastService.findAllForDataTable(
        page,
        limit,
        sortField,
        sortDir,
        search.value,
    );
    res.json({
        draw: Number(draw),
        recordsTotal: total,
        recordsFiltered: filterd,
        data: items,
    });
};

export const getForecastForMap = async (req: Request, res: Response) => {
    const forecastId = req.params.forecastId as string;
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
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            status: 'error',
            message: 'Internal Server Error',
        });
    }
};