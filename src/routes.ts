import { Router } from 'express';

import {
    forecastApiRouter,
    forecastRouter,
} from '@/modules/forecast/forecast.route';
import { homeRouter } from '@/modules/home/home.route';
import { isAuthenticated } from '@/shared/middlewares/auth.middleware';
import { authRouter } from '@/modules/auth/auth.route';

const router = Router();

router.use('/auth', authRouter);

router.use('/', isAuthenticated, homeRouter);
router.use('/forecast', isAuthenticated, forecastRouter);

const apiRouter = Router();

apiRouter.use('/forecast', isAuthenticated, forecastApiRouter);

export { router, apiRouter };
