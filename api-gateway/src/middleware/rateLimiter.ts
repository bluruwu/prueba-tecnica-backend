import type { Request, Response, NextFunction } from 'express';

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 100;
const memoryStore = new Map<string, { count: number; resetTime: number }>();

setInterval(() => {
    const now = Date.now();
    for (const [key, value] of memoryStore.entries()) {
        if (now > value.resetTime) memoryStore.delete(key);
    }
}, WINDOW_MS);

export const rateLimiter = (req: Request, res: Response, next: NextFunction) => {
    const key = req.headers['x-api-key'] as string || req.ip;
    if (!key) {
        return res.status(401).json({ message: 'API Key is required' });
    }
    const now = Date.now();
    const record = memoryStore.get(key);

    if (!record || now > record.resetTime) {
        memoryStore.set(key, { count: 1, resetTime: now + WINDOW_MS });
        return next();
    }

    record.count++;
    if (record.count > MAX_REQUESTS) {
        const retryAfter = Math.ceil((record.resetTime - now) / 1000);
        res.set('Retry-After', String(retryAfter));
        return res.status(429).json({ message: 'Too Many Requests', retryAfter });
    }

    next();
};
