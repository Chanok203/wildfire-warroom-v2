import 'dotenv/config';
import http from 'http';

import { app } from '@/app';
import { config } from '@/configs';

const httpServer = http.createServer(app);

const { port, host } = config.app;
httpServer.listen(port, host, () => {
    console.log(`Server is running at http://${host}:${port}`);
});
