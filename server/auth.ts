import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { getDatabase } from './mongodb';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isAdmin: boolean;
}

export type AuthRequest = Request;

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

export function verifyToken(token: string): AuthUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  const headerToken = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  const cookieToken = req.cookies?.authToken; // Cookie token
  
  console.log('Auth middleware - cookies:', req.cookies);
  console.log('Auth middleware - authToken cookie:', cookieToken);
  console.log('Auth middleware - authorization header:', authHeader);
  
  const token = headerToken || cookieToken;

  if (!token) {
    console.log('Auth middleware - no token found');
    res.status(401).json({ message: 'Access token required' });
    return;
  }

  const user = verifyToken(token);
  if (!user) {
    console.log('Auth middleware - invalid token');
    res.status(403).json({ message: 'Invalid or expired token' });
    return;
  }

  console.log('Auth middleware - user authenticated:', user.email);
  req.user = user;
  next();
}

export async function requireAdmin(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ message: 'Authentication required' });
    return;
  }

  if (!req.user.isAdmin) {
    res.status(403).json({ message: 'Admin access required' });
    return;
  }

  next();
}

export async function createUser(userData: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  isAdmin?: boolean;
}): Promise<AuthUser> {
  const db = getDatabase();
  const users = db.collection('users');

  // Check if user already exists
  const existingUser = await users.findOne({ email: userData.email });
  if (existingUser) {
    throw new Error('User with this email already exists');
  }

  // Hash password
  const hashedPassword = await hashPassword(userData.password);

  // Create user
  const newUser = {
    email: userData.email,
    password: hashedPassword,
    firstName: userData.firstName,
    lastName: userData.lastName,
    isAdmin: userData.isAdmin || false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const result = await users.insertOne(newUser);
  
  return {
    id: result.insertedId.toString(),
    email: newUser.email,
    firstName: newUser.firstName,
    lastName: newUser.lastName,
    isAdmin: newUser.isAdmin,
  };
}

export async function loginUser(email: string, password: string): Promise<{ user: AuthUser; token: string } | null> {
  const db = getDatabase();
  const users = db.collection('users');

  const user = await users.findOne({ email });
  if (!user) {
    return null;
  }

  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    return null;
  }

  const authUser: AuthUser = {
    id: user._id.toString(),
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    isAdmin: user.isAdmin || false,
  };

  const token = generateToken(authUser);

  // Update last login
  await users.updateOne(
    { _id: user._id },
    { $set: { updatedAt: new Date() } }
  );

  return { user: authUser, token };
}

export async function getUserById(id: string): Promise<AuthUser | null> {
  const db = getDatabase();
  const users = db.collection('users');

  try {
    const user = await users.findOne({ _id: new ObjectId(id) });
    if (!user) {
      return null;
    }

    return {
      id: user._id.toString(),
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin || false,
    };
  } catch (error) {
    return null;
  }
}
