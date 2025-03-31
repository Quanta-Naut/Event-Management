import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { storage } from './storage';
import { type User } from '@shared/schema';
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

// Generate a secure fallback JWT secret if not provided in env variables
const generateFallbackSecret = () => {
  // This creates a random 32-byte string that's different each time the server starts
  return crypto.randomBytes(32).toString('hex');
};

// Secret key for JWT - use environment variable or generate a secure fallback
const JWT_SECRET = process.env.JWT_SECRET || generateFallbackSecret();

// If using fallback secret, show a warning in development
if (!process.env.JWT_SECRET && process.env.NODE_ENV !== 'production') {
  console.warn('\x1b[33m%s\x1b[0m', 
    '⚠️ Warning: Using a generated JWT_SECRET. This will invalidate all existing tokens when the server restarts.\n' +
    'For persistent sessions, set the JWT_SECRET environment variable in your .env file.'
  );
} else if (!process.env.JWT_SECRET && process.env.NODE_ENV === 'production') {
  console.error('\x1b[31m%s\x1b[0m', 
    '⚠️ CRITICAL: Running in production without JWT_SECRET environment variable.\n' +
    'This is a security risk and will cause all tokens to invalidate on server restart.'
  );
}

// Token expiration time (in seconds)
const TOKEN_EXPIRATION = 60 * 60 * 24; // 24 hours

export async function generatePasswordHash(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(user: User): string {
  const payload = {
    id: user.id,
    username: user.username,
  };
  
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRATION,
  });
}

export function verifyToken(token: string): { id: number; username: string } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { id: number; username: string };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      console.error('JWT verification error:', error.message);
    } else if (error instanceof jwt.TokenExpiredError) {
      console.log('Token expired');
    } else {
      console.error('Unknown token error:', error);
    }
    return null;
  }
}

// Middleware to protect routes
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  // Get the token from the Authorization header
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  // Format should be "Bearer [token]"
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return res.status(401).json({ message: 'Invalid authentication format' });
  }
  
  const token = parts[1];
  const payload = verifyToken(token);
  
  if (!payload) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
  
  // Attach user info to the request for use in route handlers
  (req as any).user = payload;
  
  next();
}

// Login functionality
export async function login(username: string, password: string): Promise<{ user: User; token: string } | null> {
  try {
    const user = await storage.getUserByUsername(username);
    
    if (!user) {
      return null;
    }
    
    const isPasswordValid = await comparePasswords(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }
    
    const token = generateToken(user);
    return { user, token };
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
}

// Register functionality - adds basic validation
export async function register(username: string, password: string): Promise<{ user: User; token: string } | null> {
  try {
    // Check if user already exists
    const existingUser = await storage.getUserByUsername(username);
    
    if (existingUser) {
      return null;
    }
    
    // Hash the password
    const hashedPassword = await generatePasswordHash(password);
    
    // Create the user
    const user = await storage.createUser({
      username,
      password: hashedPassword,
    });
    
    // Generate a token
    const token = generateToken(user);
    
    return { user, token };
  } catch (error) {
    console.error('Registration error:', error);
    return null;
  }
}