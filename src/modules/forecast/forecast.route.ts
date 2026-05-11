import { Router } from 'express';

import * as apiController from '@modules/forecast/forecast.api-controller';
import * as controller from '@modules/forecast/forecast.controller';
import { upload } from '@/shared/libs/multer.lib';
import { isAuthenticated } from '@/shared/middlewares/auth.middleware';

const router = Router();

router.get('/', isAuthenticated, controller.renderForecastList);
router.post('/:forecastId/delete', isAuthenticated, controller.handleForecastDelete);
router.get('/view', isAuthenticated, controller.renderView);
router.post('/upload', upload.single('forecastZip'), controller.handleUploadForecast);

const apiRouter = Router();

apiRouter.post('/', isAuthenticated, apiController.getForecastList);
apiRouter.get('/:forecastId', isAuthenticated, apiController.getForcast);

export { router as forecastRouter, apiRouter as forecastApiRouter };
