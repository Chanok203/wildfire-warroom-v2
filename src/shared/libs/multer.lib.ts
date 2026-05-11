import multer from 'multer';

import { config } from '@/configs';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, config.app.forecastDir);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
})

export const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 1024,
    },
});
