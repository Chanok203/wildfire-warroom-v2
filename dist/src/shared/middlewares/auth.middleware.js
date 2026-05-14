"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAuthenticated = void 0;
const users_service_1 = require("../../modules/users/users.service");
const userService = new users_service_1.UserService();
const isAuthenticated = async (req, res, next) => {
    try {
        const userId = req.session.userId;
        if (!userId) {
            throw new Error();
        }
        const user = await userService.getById(userId);
        req.currentUser = user;
        res.locals.currentUser = user;
        next();
    }
    catch (error) {
        req.flash('danger', 'กรุณาเข้าสู่ระบบ');
        return res.redirect('/auth/login');
    }
};
exports.isAuthenticated = isAuthenticated;
//# sourceMappingURL=auth.middleware.js.map