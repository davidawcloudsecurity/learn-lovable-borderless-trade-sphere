
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint for load balancer
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working', instance: process.pid });
});

// Search API endpoints
app.get('/api/search/suggestions', (req, res) => {
  const query = req.query.q;
  const suggestions = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Books',
    'Toys',
    'Automotive',
    'Health & Beauty'
  ].filter(item => item.toLowerCase().includes(query?.toLowerCase() || ''));
  
  res.json({ suggestions });
});

app.get('/api/search', (req, res) => {
  const { q, limit = 20, offset = 0 } = req.query;
  res.json({
    query: q,
    results: [],
    total: 0,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
});

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle React Router - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Don't try to server-side render React components
  // Just serve the static HTML file
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Bind to all interfaces (0.0.0.0) not just localhost
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT} (PID: ${process.pid})`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  process.exit(0);
});
