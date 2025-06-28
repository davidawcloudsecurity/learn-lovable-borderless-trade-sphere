import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors()); // Allow requests from Vite dev server
app.use(express.json());

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
  const products = [
    { id: 1, name: 'MacBook Pro', price: 2500 },
    { id: 2, name: 'Lamp Shade', price: 25 },
    { id: 3, name: 'Laser Printer', price: 150 },
  ];
  const filtered = products.filter(item => item.name.toLowerCase().includes(q));
  res.json({
    success: true,
    data: filtered,
    pagination: {
      limit: 20,
      offset: 0,
      total: filtered.length,
    },
  });
});

app.listen(PORT, () => {
  console.log(`✅ API server is running at http://localhost:${PORT}`);
});
