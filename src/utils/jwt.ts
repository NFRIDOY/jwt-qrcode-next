import { config } from '@/config';
import jwt, { JwtPayload } from 'jsonwebtoken';

export function verifyJwt(token: string): JwtPayload | null {
    try {
        console.log("config.jwt_secret", config.jwt_secret)
        return jwt.verify(token, config.jwt_secret as string) as JwtPayload;
    } catch (error) {
        console.error('JWT verification failed:', error);
        return null;
    }
}