import { Request, Response } from 'express';


import { config } from '@/configs';
import { ForecastService } from '@/modules/forecast/forecast.service';

const entity = 'forecast';

const forecastService = new ForecastService();

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
    const qgisUrl = `${config.qgis.url}`
    res.render('forecast/forecast-view.html', { entity, forecastId, qgisUrl });
};

