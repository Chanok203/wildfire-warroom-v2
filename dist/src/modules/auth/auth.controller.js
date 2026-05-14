"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleLogout = exports.handleLogin = exports.renderLoginView = void 0;
const users_service_1 = require("../../modules/users/users.service");
const error_utils_1 = require("../../shared/utils/error.utils");
const entity = 'auth';
const userService = new users_service_1.UserService();
const renderLoginView = async (req, res) => {
    res.render('auth/auth-login.html', { entity });
};
exports.renderLoginView = renderLoginView;
const handleLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await userService.getByUsername(username);
        const isMatch = await userService.verifyPassword(password, user.password);
        if (!isMatch)
            throw new error_utils_1.BadRequestError(`Invalid password`);
        req.session.userId = user.id;
        req.flash('success', `ยินดีต้อนรับคุณ ${username}`);
        return res.redirect('/forecast/view');
    }
    catch (error) {
        const errorMsg = `ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง`;
        req.flash('danger', errorMsg);
        return res.redirect('/auth/login');
    }
};
exports.handleLogin = handleLogin;
const handleLogout = async (req, res) => {
    req.session.destroy((err) => {
        if (err)
            throw err;
        res.clearCookie('connect.sid'); // ลบไฟล์ Cookie ที่ Browser
        return res.redirect('/auth/login');
    });
};
exports.handleLogout = handleLogout;
//# sourceMappingURL=auth.controller.js.map