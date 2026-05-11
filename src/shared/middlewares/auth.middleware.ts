import { NextFunction, Request, Response } from 'express';

import { UserService } from '@/modules/users/users.service';

const userService = new UserService();

export const isAuthenticated = async (
    req: Request,
    res: Response,
    next: NextFunction,
) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            throw new Error();
        }
        const user = await userService.getById(userId);
        req.currentUser = user;
        res.locals.currentUser = user;
        next();
    } catch (error) {
        req.flash('danger', 'กรุณาเข้าสู่ระบบ');
        return res.redirect('/auth/login');
    }
};
