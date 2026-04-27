import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import { loggerMiddleware } from './middleware/logger.js';
import { authMiddleware } from '../auth.js';
import { rateLimiter } from './middleware/rateLimiter.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT;
const PAYMENT_SERVICE_URL = process.env.PAYMENT_SERVICE_URL;

if (!PAYMENT_SERVICE_URL || !PORT) {
    throw new Error('PAYMENT_SERVICE_URL or PORT is not defined in environment variables');
}

app.use(loggerMiddleware);

app.use(
    '/api/v1',
    authMiddleware,
    rateLimiter,
    createProxyMiddleware({
        target: PAYMENT_SERVICE_URL,
        changeOrigin: true,
        pathRewrite: {
            '^/api/v1': '',
        },
        on: {
            error: (err, req, res) => {
                if ('status' in res) {
                    res.status(500).json({ message: 'Error in the proxy', error: err.message });
                } else {
                    res.end();
                }
            },
        },
    })
);

app.listen(PORT, () => {
    console.log(`API Gateway running on http://localhost:${PORT}`);
});
