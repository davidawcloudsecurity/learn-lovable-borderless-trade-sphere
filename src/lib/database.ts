
import { Pool } from 'pg';

// Database configuration - update these with your RDS details
const dbConfig = {
  host: process.env.REACT_APP_DB_HOST || 'your-rds-endpoint.region.rds.amazonaws.com',
  port: parseInt(process.env.REACT_APP_DB_PORT || '5432'),
  database: process.env.REACT_APP_DB_NAME || 'your_database_name',
  user: process.env.REACT_APP_DB_USER || 'your_username',
  password: process.env.REACT_APP_DB_PASSWORD || 'your_password',
  ssl: {
    rejectUnauthorized: false
  }
};

// Create a connection pool
export const pool = new Pool(dbConfig);

// Test connection
export const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log('Connected to RDS PostgreSQL database');
    client.release();
    return true;
  } catch (err) {
    console.error('Database connection error:', err);
    return false;
  }
};

// Helper function to execute queries
export const query = async (text: string, params?: any[]) => {
  const client = await pool.connect();
  try {
    const result = await client.query(text, params);
    return result;
  } finally {
    client.release();
  }
};