import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import prisma from '../lib/prisma';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

const checkUserExistsInDb = async (userId: string): Promise<boolean> => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true }
        });
        return user !== null;
    } catch (error) {
        console.error("Database check error in auth middleware:", error);
        return false; 
    }
};

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        res.status(401).json({ message: "Authorization token missing or malformed. Expected 'Bearer <token>'." });
        return;
    }

    const token = authHeader.split(" ")[1];

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
        console.error("JWT_SECRET is not defined in environment variables. Server misconfiguration.");
        res.status(500).json({ message: "Server authentication error: Secret not configured." });
        return;
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as { id: string; email: string };

        req.user = payload;

        const userExists = await checkUserExistsInDb(req.user.id);
        if (!userExists) {
            res.status(401).json({ message: "User associated with this token no longer exists or is inactive." });
            return;
        }

        next();
    } catch (error) {
        if (error instanceof TokenExpiredError) {
            res.status(401).json({ message: "Token expired. Please log in again." });
        } else if (error instanceof JsonWebTokenError) {
            res.status(401).json({ message: "Invalid token. Authentication failed." });
        } else {
            console.error("Unexpected authentication error:", error);
            res.status(500).json({ message: "An unexpected error occurred during authentication." });
        }
    }
};