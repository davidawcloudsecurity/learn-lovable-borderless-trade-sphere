import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors()); // Allow requests from Vite dev server
app.use(express.json());

// Mock products with complete data structure
const mockProducts = [
  {
    id: 1,
    name: 'MacBook Pro',
    price: 2500,
    originalPrice: 2800,
    image: 'photo-1647805256812-ccb927cf1f67',
    country: 'USA',
    flag: '🇺🇸',
    rating: 4.8,
    reviews: 1250,
    shipping: 'Free shipping',
    category: 'Electronics'
  },
  {
    id: 2,
    name: 'Lamp Shade',
    price: 25,
    originalPrice: 35,
    image: 'photo-1694353560850-436cb191fb8c',
    country: 'Italy',
    flag: '🇮🇹',
    rating: 4.2,
    reviews: 89,
    shipping: '$5.99 shipping',
    category: 'Home & Garden'
  },
  {
    id: 3,
    name: 'Laser Printer',
    price: 150,
    originalPrice: 199,
    image: 'photo-1625961332771-3f40b0e2bdcf',
    country: 'Japan',
    flag: '🇯🇵',
    rating: 4.5,
    reviews: 456,
    shipping: 'Free shipping',
    category: 'Electronics'
  },
  {
    id: 4,
    name: 'Laptop Stand',
    price: 45,
    originalPrice: 60,
    image: 'photo-1623251606108-512c7c4a3507',
    country: 'Germany',
    flag: '🇩🇪',
    rating: 4.3,
    reviews: 234,
    shipping: '$3.99 shipping',
    category: 'Electronics'
  },
  {
    id: 5,
    name: 'LED Light Bulb',
    price: 12,
    originalPrice: 18,
    image: 'photo-1553213134-f60afad82ceb',
    country: 'China',
    flag: '🇨🇳',
    rating: 4.1,
    reviews: 567,
    shipping: 'Free shipping',
    category: 'Home & Garden'
  },
  {
    id: 6,
    name: 'Luggage Set',
    price: 120,
    originalPrice: 160,
    image: 'photo-1708403120467-1715bb6840df',
    country: 'France',
    flag: '🇫🇷',
    rating: 4.6,
    reviews: 123,
    shipping: '$8.99 shipping',
    category: 'Travel'
  },
  {
    id: 7,
    name: 'Camping Lantern',
    price: 35,
    originalPrice: 50,
    image: 'photo-1570739260082-39a84dae80c8',
    country: 'Canada',
    flag: '🇨🇦',
    rating: 4.4,
    reviews: 198,
    shipping: 'Free shipping',
    category: 'Outdoor'
  }
];

// Suggestion endpoint
app.get('/api/search/suggestions', (req, res) => {
  const q = req.query.q?.toLowerCase() || '';
  const allSuggestions = ['laptop', 'lamp', 'laser printer', 'luggage', 'light bulb', 'lantern'];
  const filtered = allSuggestions.filter(item => item.includes(q));
  res.json({ suggestions: filtered });
});

// Search endpoint
app.get('/api/search', (req, res) => {
  const q = req.query.q?.toLowerCase() || '';
  const limit = parseInt(req.query.limit) || 12;
  const offset = parseInt(req.query.offset) || 0;
  
  // Filter products based on search query
  const filteredProducts = mockProducts.filter(item => 
    item.name.toLowerCase().includes(q) || 
    item.category.toLowerCase().includes(q)
  );
  
  // Apply pagination
  const paginatedResults = filteredProducts.slice(offset, offset + limit);
  
  res.json({
    query: q,
    results: paginatedResults,
    total: filteredProducts.length,
    limit: limit,
    offset: offset
  });
});

app.listen(PORT, () => {
  console.log(`✅ API server is running at http://localhost:${PORT}`);
});
