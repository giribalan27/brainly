import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

// Extend Express Request interface to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    // console.log(authHeader);
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Authorization header is missing",
      });
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        error: "Token is missing",
      });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET! as string) as {
      id: string;
      name: string;
    };
    req.userId = decoded.id;
    next();
  } catch (e) {
    console.log(e);
    res.status(401).json({
      error: "Invalid or expired token",
    });
  }
};
