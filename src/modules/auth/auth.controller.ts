import { Request, Response } from 'express';

import { UserService } from '@/modules/users/users.service';
import { BadRequestError } from '@/shared/utils/error.utils';

const entity = 'auth';

const userService = new UserService();

export const renderLoginView = async (req: Request, res: Response) => {
    res.render('auth/auth-login.html', { entity });
};

export const handleLogin = async (req: Request, res: Response) => {
    const { username, password } = req.body;

    try {
        const user = await userService.getByUsername(username);
        const isMatch = await userService.verifyPassword(
            password,
            user.password,
        );
        if (!isMatch) throw new BadRequestError(`Invalid password`);
        req.session.userId = user.id;
        req.flash('success', `ยินดีต้อนรับคุณ ${username}`);
        return res.redirect('/forecast/view');
    } catch (error) {
        const errorMsg = `ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง`;
        req.flash('danger', errorMsg);
        return res.redirect('/auth/login');
    }
};

export const handleLogout = async (req: Request, res: Response) => {
    req.session.destroy((err) => {
        if (err) throw err;
        res.clearCookie('connect.sid'); // ลบไฟล์ Cookie ที่ Browser
        return res.redirect('/auth/login');
    });
};
