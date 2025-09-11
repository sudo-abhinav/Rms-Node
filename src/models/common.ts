import jwt from 'jsonwebtoken';
import { JWT_SECRET, JWT_EXPIRES_IN } from '../utils/jwt';

 export interface UserJwtPayload {
        id: string;
        email: string;
        role: string;
        createdAt : Date
    }