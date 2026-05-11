import { Request, Response } from 'express';

import { UserService } from '@/modules/users/users.service';

const entity = 'users';
const userService = new UserService();

export const renderUserList = async (req: Request, res: Response) => {
    const userList = await userService.getList();
    res.render('users/users-list.html', { entity, userList });
};

export const handleDeleteUser = async (req: Request, res: Response) => {
    const { id } = req.body;
    if (id === req.currentUser!.id) {
        req.flash('danger', 'คุณไม่สามารถลบตัวเองได้');
        return res.redirect('/users');
    }

    try {
        await userService.deleteById(id);
        req.flash('success', 'ลบสำเร็จแล้ว');
        return res.redirect('/users');
    } catch (error) {
        req.flash('danger', 'ลบไม่สำเร็จ');
        return res.redirect('/users');
    }
};

export const handleCreateUser = async (req: Request, res: Response) => {
    const { username, password, password2 } = req.body;

    if (password !== password2) {
        req.flash('danger', 'สร้างผู้ใช้ไม่สำเร็จแล้ว');
    }

    try {
        const user = await userService.create(username, password);
        req.flash('success', `สร้างผู้ใช้ ${user.username} สำเร็จแล้ว`);
        res.redirect('/users');
    } catch (error) {
        req.flash('danger', `สร้างผู้ใช้ไม่สำเร็จแล้ว`);
        res.redirect('/users');
    }
};

export const handleEditUser = async (req: Request, res: Response) => {
    const id: string = req.params.id as string;
    const { password, password2 } = req.body;

    if (password !== password2) {
        req.flash('danger', 'แก้ไขผู้ใช้ไม่สำเร็จแล้ว');
        return res.redirect('/users');
    }
    try {
        const user = await userService.setPassword(id, password);
        req.flash("success", "แก้ไขผู้ใช้สำเร็จแล้ว");
        return res.redirect('/users');
    } catch (error) {
        req.flash("danger", "แก้ไขผู้ใช้ไม่สำเร็จ");
        return res.redirect('/users');
    }
};
