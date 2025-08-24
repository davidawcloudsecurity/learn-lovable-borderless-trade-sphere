// app.js
import express from 'express';
import cors from 'cors';
import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// PostgreSQL connection pool
const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  port: process.env.POSTGRES_PORT || 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test DB connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('❌ Error connecting to PostgreSQL:', err);
  } else {
    console.log('✅ Connected to PostgreSQL database');
    release();
  }
});

// Suggestion endpoint
app.get('/api/search/suggestions', async (req, res) => {
  try {
    const q = req.query.q?.toLowerCase() || '';
    const query = `
      SELECT DISTINCT name 
      FROM products 
      WHERE LOWER(name) LIKE $1 OR LOWER(category) LIKE $1
      LIMIT 10
    `;
    const result = await pool.query(query, [`%${q}%`]);
    const suggestions = result.rows.map(row => row.name.toLowerCase());
    res.json({ suggestions });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const q = req.query.q?.toLowerCase() || '';
    const limit = parseInt(req.query.limit) || 12;
    const offset = parseInt(req.query.offset) || 0;

    const countQuery = `
      SELECT COUNT(*) as total 
      FROM products 
      WHERE LOWER(name) LIKE $1 OR LOWER(category) LIKE $1
    `;
    const countResult = await pool.query(countQuery, [`%${q}%`]);
    const total = parseInt(countResult.rows[0].total);

    const dataQuery = `
      SELECT * FROM products 
      WHERE LOWER(name) LIKE $1 OR LOWER(category) LIKE $1
      ORDER BY id
      LIMIT $2 OFFSET $3
    `;
    const dataResult = await pool.query(dataQuery, [`%${q}%`, limit, offset]);

    res.json({
      query: q,
      results: dataResult.rows,
      total: total,
      limit: limit,
      offset: offset
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default app;
