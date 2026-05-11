import { Router } from 'express';

import { apiKeyRouter } from '@/modules/apikey/apikey.route';
import { authRouter } from '@/modules/auth/auth.route';
import {
    forecastApiRouter,
    forecastRouter,
} from '@/modules/forecast/forecast.route';
import { homeRouter } from '@/modules/home/home.route';
import { userRouter } from '@/modules/users/users.route';
import { isAuthenticated } from '@/shared/middlewares/auth.middleware';

const router = Router();

router.use('/auth', authRouter);
router.use('/forecast', forecastRouter);

router.use('/', isAuthenticated, homeRouter);
router.use('/users', isAuthenticated, userRouter);
router.use('/apikey', isAuthenticated, apiKeyRouter);

const apiRouter = Router();

apiRouter.use('/forecast', isAuthenticated, forecastApiRouter);

export { router, apiRouter };
