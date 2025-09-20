 import { Request, Response, NextFunction } from 'express';
import { UserJwtPayload } from '../models/common'; // your custom type
import { verifyJwtToken } from '../utils/jwt';
import { db } from '../db/connection';
import { users } from '../db/schema/user';
import { eq } from 'drizzle-orm';



export interface AuthenticatedRequest extends Request {
  user?: UserJwtPayload;
}


export const authMiddleware = async (
  req: AuthenticatedRequest , res: Response, next: NextFunction) => {
  try {
    // Extract token from Authorization header (format: "Bearer <token>")
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Decode JWT
    const decoded = verifyJwtToken(token);
    console.log(decoded);

    if (!decoded) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    // Ensure decoded object has the expected email and role
    if (!decoded.email) {
      return res.status(401).json({ message: 'Invalid token payload' });
    }

    // Query database to verify user and role
    const dbUser = await db
      .select({
        id : users.id,
        email: users.email,
        role: users.role,
        // Add other user fields as needed
      })
      .from(users)
      .where(eq(users.email, decoded.email))
      .limit(1);

    if (dbUser.length === 0) {
      return res.status(401).json({ message: 'User not found or unauthorized' });
    }
    req.user = decoded; 

    next();
  } catch (error ) {
    console.log('Error in authMiddleware:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

