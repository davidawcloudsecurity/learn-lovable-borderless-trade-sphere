
const express = require('express');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sample product data for search results
const sampleProducts = [
  {
    id: 1,
    name: "Premium Wireless Headphones with Noise Cancellation",
    price: 299,
    originalPrice: 399,
    image: "photo-1505740420928-5e560c06d30e",
    country: "Germany",
    flag: "🇩🇪",
    rating: 4.8,
    reviews: 2543,
    shipping: "Free shipping worldwide",
    category: "Electronics"
  },
  {
    id: 2,
    name: "Smart Fitness Watch with Health Monitoring",
    price: 199,
    originalPrice: 249,
    image: "photo-1523275335684-37898b6baf30",
    country: "Japan",
    flag: "🇯🇵",
    rating: 4.6,
    reviews: 1876,
    shipping: "Express delivery available",
    category: "Electronics"
  },
  {
    id: 3,
    name: "Professional Camera Lens 50mm f/1.4",
    price: 549,
    image: "photo-1580567567605-ddfc2d68ef13",
    country: "USA",
    flag: "🇺🇸",
    rating: 4.9,
    reviews: 892,
    shipping: "Insured shipping included",
    category: "Electronics"
  },
  {
    id: 4,
    name: "Luxury Designer Handbag",
    price: 899,
    originalPrice: 1199,
    image: "photo-1594223274512-ad4803739b7c",
    country: "Italy",
    flag: "🇮🇹",
    rating: 4.7,
    reviews: 445,
    shipping: "Gift wrapping available",
    category: "Fashion"
  },
  {
    id: 5,
    name: "Ergonomic Office Chair with Lumbar Support",
    price: 399,
    originalPrice: 499,
    image: "photo-1586023492125-27b2c045efd7",
    country: "Sweden",
    flag: "🇸🇪",
    rating: 4.7,
    reviews: 1234,
    shipping: "White glove delivery",
    category: "Home & Garden"
  },
  {
    id: 6,
    name: "Artisan Coffee Beans Premium Blend",
    price: 29,
    image: "photo-1559056199-641a0ac8b55e",
    country: "Brazil",
    flag: "🇧🇷",
    rating: 4.5,
    reviews: 567,
    shipping: "Same day local delivery",
    category: "Food"
  },
  {
    id: 7,
    name: "Portable Solar Power Bank 20000mAh",
    price: 79,
    image: "photo-1662601355172-772b4daa361d",
    country: "China",
    flag: "🇨🇳",
    rating: 4.4,
    reviews: 2156,
    shipping: "Economy shipping",
    category: "Electronics"
  },
  {
    id: 8,
    name: "Handcrafted Wooden Kitchen Set",
    price: 159,
    originalPrice: 199,
    image: "photo-1556909114-f6e7ad7d3136",
    country: "Canada",
    flag: "🇨🇦",
    rating: 4.6,
    reviews: 789,
    shipping: "Fragile item protection",
    category: "Home & Garden"
  },
  {
    id: 9,
    name: "Professional Running Shoes",
    price: 149,
    originalPrice: 189,
    image: "photo-1542291026-7eec264c27ff",
    country: "Germany",
    flag: "🇩🇪",
    rating: 4.8,
    reviews: 3421,
    shipping: "Free returns",
    category: "Sports"
  },
  {
    id: 10,
    name: "Vintage Leather Jacket",
    price: 299,
    image: "photo-1551028719-00167b16eac5",
    country: "USA",
    flag: "🇺🇸",
    rating: 4.5,
    reviews: 892,
    shipping: "Express delivery",
    category: "Fashion"
  }
];

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
  const query = req.query.q?.toLowerCase() || '';
  const suggestions = [
    'Electronics',
    'Fashion',
    'Home & Garden',
    'Sports',
    'Books',
    'Toys',
    'Automotive',
    'Health & Beauty',
    'headphones',
    'watch',
    'camera',
    'handbag',
    'chair',
    'coffee',
    'power bank',
    'kitchen',
    'shoes',
    'jacket'
  ].filter(item => item.toLowerCase().includes(query));
  
  res.json({ suggestions: suggestions.slice(0, 8) });
});

app.get('/api/search', (req, res) => {
  const { q, limit = 20, offset = 0 } = req.query;
  const query = q?.toLowerCase() || '';
  
  // Filter products based on search query
  const filteredProducts = sampleProducts.filter(product => 
    product.name.toLowerCase().includes(query) ||
    product.category.toLowerCase().includes(query) ||
    product.country.toLowerCase().includes(query)
  );
  
  // Apply pagination
  const startIndex = parseInt(offset);
  const endIndex = startIndex + parseInt(limit);
  const paginatedResults = filteredProducts.slice(startIndex, endIndex);
  
  res.json({
    query: q,
    results: paginatedResults,
    total: filteredProducts.length,
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
