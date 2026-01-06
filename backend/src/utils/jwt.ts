import jwt, { SignOptions } from 'jsonwebtoken';
import type { StringValue } from 'ms';

/**
 * Get JWT secret with validation
 * Validates on first use (lazy validation)
 */
const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }
  return secret;
};

/**
 * Generate JWT token
 */
export const signToken = (payload: object): string => {
  const JWT_SECRET = getJwtSecret();
  const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';
  
  const options: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as StringValue | number
  };
  return jwt.sign(payload, JWT_SECRET, options);
};
