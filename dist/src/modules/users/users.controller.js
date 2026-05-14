"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleEditUser = exports.handleCreateUser = exports.handleDeleteUser = exports.renderUserList = void 0;
const users_service_1 = require("../../modules/users/users.service");
const entity = 'users';
const userService = new users_service_1.UserService();
const renderUserList = async (req, res) => {
    const userList = await userService.getList();
    res.render('users/users-list.html', { entity, userList });
};
exports.renderUserList = renderUserList;
const handleDeleteUser = async (req, res) => {
    const { id } = req.body;
    if (id === req.currentUser.id) {
        req.flash('danger', 'คุณไม่สามารถลบตัวเองได้');
        return res.redirect('/users');
    }
    try {
        await userService.deleteById(id);
        req.flash('success', 'ลบสำเร็จแล้ว');
        return res.redirect('/users');
    }
    catch (error) {
        req.flash('danger', 'ลบไม่สำเร็จ');
        return res.redirect('/users');
    }
};
exports.handleDeleteUser = handleDeleteUser;
const handleCreateUser = async (req, res) => {
    const { username, password, password2 } = req.body;
    if (password !== password2) {
        req.flash('danger', 'สร้างผู้ใช้ไม่สำเร็จแล้ว');
    }
    try {
        const user = await userService.create(username, password);
        req.flash('success', `สร้างผู้ใช้ ${user.username} สำเร็จแล้ว`);
        res.redirect('/users');
    }
    catch (error) {
        req.flash('danger', `สร้างผู้ใช้ไม่สำเร็จแล้ว`);
        res.redirect('/users');
    }
};
exports.handleCreateUser = handleCreateUser;
const handleEditUser = async (req, res) => {
    const id = req.params.id;
    const { password, password2 } = req.body;
    if (password !== password2) {
        req.flash('danger', 'แก้ไขผู้ใช้ไม่สำเร็จแล้ว');
        return res.redirect('/users');
    }
    try {
        const user = await userService.setPassword(id, password);
        req.flash("success", "แก้ไขผู้ใช้สำเร็จแล้ว");
        return res.redirect('/users');
    }
    catch (error) {
        req.flash("danger", "แก้ไขผู้ใช้ไม่สำเร็จ");
        return res.redirect('/users');
    }
};
exports.handleEditUser = handleEditUser;
//# sourceMappingURL=users.controller.js.map