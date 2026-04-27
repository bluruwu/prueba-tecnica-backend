import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';


export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const SECRET_KEY = process.env.JWT_SECRET;
    const authHeader = req.headers.authorization;
    const apiKey = req.headers['x-api-key'];
    if (!SECRET_KEY) {
        throw new Error('SECRET_KEY is not defined in environment variables');
    }
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const parts = authHeader.split(' ');
        const token = parts[1];
        if (!token) {
            return res.status(401).json({ message: 'Token not provided in Bearer header' });
        }
        try {
            const decoded = jwt.verify(token, SECRET_KEY);
            (req as any).user = decoded;
            return next();
        } catch (err) {
            return res.status(401).json({ message: 'Invalid JWT' });
        }
    }

    if (apiKey) {
        return next();
    }

    return res.status(401).json({ message: 'Missing Authentication (JWT or API Key)' });
};
