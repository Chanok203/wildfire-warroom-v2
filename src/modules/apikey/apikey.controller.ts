import { Request, Response } from 'express';

import { ApiKeyService } from '@/modules/apikey/apikey.service';

const entity = 'apikey';
const apiKeyService = new ApiKeyService();

export const renderApiKeyList = async (req: Request, res: Response) => {
    const apiKeyList = await apiKeyService.getList();
    res.render('apikey/apikey-list.html', { entity, apiKeyList });
};

export const handleCreateApiKey = async (req: Request, res: Response) => {
    const { name, key } = req.body;

    try {
        const apikey = await apiKeyService.create(name, key);
        req.flash('success', 'สร้าง API Key สำเร็จแล้ว');
        return res.redirect('/apikey');
    } catch (error) {
        req.flash('danger', 'สร้าง API Key ไม่สำเร็จ');
        return res.redirect('/apikey');
    }
};

export const handleDeleteApiKey = async (req: Request, res: Response) => {
    const { key } = req.body;
    try {
        const apikey = await apiKeyService.delete(key);
        req.flash('success', 'ลบ API Key สำเร็จแล้ว');
        return res.redirect('/apikey');
    } catch (error) {
        console.log(error)
        req.flash('danger', 'ลบ API Key ไม่สำเร็จ');
        return res.redirect('/apikey');
    }
};
