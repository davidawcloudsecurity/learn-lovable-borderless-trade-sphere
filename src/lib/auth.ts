
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from './database';

const JWT_SECRET = process.env.REACT_APP_JWT_SECRET || 'your-jwt-secret-key';
const JWT_EXPIRES_IN = '7d';

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  created_at: Date;
}

export interface AuthResult {
  user: User | null;
  token: string | null;
  error: string | null;
}

// Hash password
export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

// Verify password
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(password, hashedPassword);
};

// Generate JWT token
export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// Verify JWT token
export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch {
    return null;
  }
};

// Sign up user
export const signUp = async (
  email: string, 
  password: string, 
  firstName?: string, 
  lastName?: string
): Promise<AuthResult> => {
  try {
    // Check if user already exists
    const existingUser = await query('SELECT id FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return { user: null, token: null, error: 'User already exists' };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const result = await query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1, $2, $3, $4) RETURNING id, email, first_name, last_name, created_at',
      [email, hashedPassword, firstName, lastName]
    );

    const user = result.rows[0];
    const token = generateToken(user.id);

    return { user, token, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { user: null, token: null, error: 'Failed to create account' };
  }
};

// Sign in user
export const signIn = async (email: string, password: string): Promise<AuthResult> => {
  try {
    // Get user by email
    const result = await query(
      'SELECT id, email, password_hash, first_name, last_name, created_at FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return { user: null, token: null, error: 'Invalid credentials' };
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return { user: null, token: null, error: 'Invalid credentials' };
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password hash from user object
    const { password_hash, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { user: null, token: null, error: 'Failed to sign in' };
  }
};

// Get user by token
export const getUserFromToken = async (token: string): Promise<User | null> => {
  try {
    const decoded = verifyToken(token);
    if (!decoded) return null;

    const result = await query(
      'SELECT id, email, first_name, last_name, created_at FROM users WHERE id = $1',
      [decoded.userId]
    );

    return result.rows[0] || null;
  } catch (error) {
    console.error('Get user from token error:', error);
    return null;
  }
};
