import { Router } from 'express';

import * as controller from '@modules/auth/auth.controller';

const router = Router();

router.get('/login', controller.renderLoginView);
router.post('/login', controller.handleLogin);
router.post('/logout', controller.handleLogout);

export { router as authRouter };
