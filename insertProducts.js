import dotenv from 'dotenv';
import pkg from 'pg';
const { Pool } = pkg;

dotenv.config();

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  user: process.env.POSTGRES_USER || 'postgres',
  password: process.env.POSTGRES_PASSWORD || 'rootpassword',
  database: process.env.POSTGRES_DB || 'wordpress',
  port: 5432,
});

const mockProducts = [
  {
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

async function insertProducts() {
  const client = await pool.connect();
  try {
    for (const product of mockProducts) {
      await client.query(
        `INSERT INTO products
          (name, price, original_price, image, country, flag, rating, reviews, shipping, category)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          product.name,
          product.price,
          product.originalPrice,
          product.image,
          product.country,
          product.flag,
          product.rating,
          product.reviews,
          product.shipping,
          product.category
        ]
      );
    }
    console.log('✅ All products inserted successfully.');
  } catch (err) {
    console.error('❌ Error inserting products:', err);
  } finally {
    client.release();
    pool.end();
  }
}

insertProducts();
