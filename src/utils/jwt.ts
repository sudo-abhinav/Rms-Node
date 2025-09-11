import jwt, { JwtPayload } from 'jsonwebtoken';
import dotenv from "dotenv"
import { UserJwtPayload } from '../models/common';

    dotenv.config()

   
export const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables.");
}

export const JWT_EXPIRES_IN = '1h';

  
  export function generateJwtToken(id : string,email: string, role: string , createdAt: Date): string {
        const payload: JwtPayload = { id ,email, role , createdAt };
        return jwt.sign(payload, JWT_SECRET as string, { expiresIn: JWT_EXPIRES_IN });
    }

export function verifyJwtToken(token: string): UserJwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET as string);

    // Ensure it's a valid object (not a string)
    if (typeof decoded === 'string') {
      throw new Error('Invalid token payload');
    }

    const {id, email, role, createdAt } = decoded as any;

    return {
      id,
      email,
      role,
      createdAt: new Date(createdAt),
    }
  } catch (err) {
    throw new Error('Invalid or expired token');
  }
}
