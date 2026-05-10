import { Router } from 'express';

import * as apiController from '@modules/forecast/forecast.api-controller';
import * as controller from '@modules/forecast/forecast.controller';

const router = Router();

router.get('/', controller.renderForecastList);
router.post('/:forecastId/delete', controller.handleForecastDelete);
router.get('/view', controller.renderView);

const apiRouter = Router();

apiRouter.post('/', apiController.getForecastList);
apiRouter.get('/:forecastId', apiController.getForcast);

export { router as forecastRouter, apiRouter as forecastApiRouter };
