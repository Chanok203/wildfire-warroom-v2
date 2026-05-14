"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const connect_flash_1 = __importDefault(require("connect-flash"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const nunjucks_1 = __importDefault(require("nunjucks"));
const configs_1 = require("./configs");
const routes_1 = require("./routes");
const session_1 = require("./shared/libs/session");
const error_utils_1 = require("./shared/utils/error.utils");
exports.app = (0, express_1.default)();
nunjucks_1.default.configure(path_1.default.join(__dirname, '..', 'views'), {
    express: exports.app,
    autoescape: true,
    noCache: configs_1.config.app.isDev,
});
exports.app.use((0, cors_1.default)());
if (configs_1.config.app.isDev) {
    exports.app.use('/public', express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
    exports.app.use((0, morgan_1.default)('dev'));
}
else {
    exports.app.use((0, morgan_1.default)('combined'));
    exports.app.use('/public', express_1.default.static(path_1.default.join(__dirname, '..', 'public')));
}
exports.app.use(express_1.default.json({ limit: '10mb' }));
exports.app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
exports.app.use(session_1.sessionConfig);
exports.app.use((0, connect_flash_1.default)());
// Flash Middleware
exports.app.use(async (req, res, next) => {
    if (req.method !== 'GET')
        return next();
    const isStaticFile = /\.(.*)$/.test(req.path);
    const isApi = req.path.startsWith('/api/');
    const isHtml = req.accepts('html');
    if (isApi || isStaticFile || !isHtml) {
        return next();
    }
    res.locals.flash_msg = req.flash();
    next();
});
exports.app.use('/', routes_1.router);
exports.app.use('/api', routes_1.apiRouter);
exports.app.use((req, res, next) => {
    res.send('404 NotFound');
});
exports.app.use((err, req, res, next) => {
    console.error(err);
    if (err instanceof error_utils_1.NotFoundError) {
        return res.status(err.statusCode).json({
            status: 'fail',
            data: err.message,
        });
    }
    if (err instanceof error_utils_1.BadRequestError) {
        return res.status(err.statusCode).json({
            status: 'fail',
            data: err.message,
        });
    }
    res.send('500 ServerInternalError');
});
//# sourceMappingURL=app.js.map