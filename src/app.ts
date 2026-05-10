import express from 'express';
import path from 'path';

import flash from 'connect-flash';
import cors from 'cors';
import morgan from 'morgan';
import nunjucks from 'nunjucks';

import { config } from '@/configs';
import { apiRouter, router } from '@/routes';
import { sessionConfig } from '@/shared/libs/session';
import { BadRequestError, NotFoundError } from '@/shared/utils/error.utils';

export const app = express();

nunjucks.configure(path.join(__dirname, '..', 'views'), {
    express: app,
    autoescape: true,
    noCache: config.app.isDev,
});

app.use(cors());

if (config.app.isDev) {
    app.use('/public', express.static(path.join(__dirname, '..', 'public')));
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
    app.use('/public', express.static(path.join(__dirname, '..', 'public')));
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(sessionConfig);
app.use(flash());

// Flash Middleware
app.use(async (req, res, next) => {
    if (req.method !== 'GET') return next();

    const isStaticFile = /\.(.*)$/.test(req.path);
    const isApi = req.path.startsWith('/api');
    const isHtml = req.accepts('html');

    if (isApi || isStaticFile || !isHtml) {
        return next();
    }

    res.locals.flash_msg = req.flash();
    next();
});
app.use('/', router);
app.use('/api', apiRouter);

app.use((req, res, next) => {
    res.send('404 NotFound');
});

app.use((err: any, req: any, res: any, next: any) => {
    console.error(err);

    if (err instanceof NotFoundError) {
        return res.status(err.statusCode).json({
            status: 'fail',
            data: err.message,
        });
    }

    if (err instanceof BadRequestError) {
        return res.status(err.statusCode).json({
            status: 'fail',
            data: err.message,
        });
    }

    res.send('500 ServerInternalError');
});
