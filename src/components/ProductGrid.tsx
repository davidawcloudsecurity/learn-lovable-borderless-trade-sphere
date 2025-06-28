
import React from 'react';
import ProductCard from './ProductCard';

const ProductGrid = () => {
  const products = [
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
      shipping: "Free shipping worldwide"
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
      shipping: "Express delivery available"
    },
    {
      id: 3,
      name: "Professional Camera Lens 50mm f/1.4",
      price: 549,
      image: "photo-1606983340126-99ab4feaa64a",
      country: "USA",
      flag: "🇺🇸",
      rating: 4.9,
      reviews: 892,
      shipping: "Insured shipping included"
    },
    {
      id: 4,
      name: "Ergonomic Office Chair with Lumbar Support",
      price: 399,
      originalPrice: 499,
      image: "photo-1586023492125-27b2c045efd7",
      country: "Sweden",
      flag: "🇸🇪",
      rating: 4.7,
      reviews: 1234,
      shipping: "White glove delivery"
    },
    {
      id: 5,
      name: "Artisan Coffee Beans - Premium Blend",
      price: 29,
      image: "photo-1559056199-641a0ac8b55e",
      country: "Brazil",
      flag: "🇧🇷",
      rating: 4.5,
      reviews: 567,
      shipping: "Same day local delivery"
    },
    {
      id: 6,
      name: "Luxury Silk Scarf Collection",
      price: 89,
      originalPrice: 129,
      image: "photo-1594223274512-ad4803739b7c",
      country: "Italy",
      flag: "🇮🇹",
      rating: 4.8,
      reviews: 445,
      shipping: "Gift wrapping available"
    },
    {
      id: 7,
      name: "Portable Solar Power Bank 20000mAh",
      price: 79,
      image: "photo-1609592806920-9bf9b9bc4418",
      country: "China",
      flag: "🇨🇳",
      rating: 4.4,
      reviews: 2156,
      shipping: "Economy shipping"
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
      shipping: "Fragile item protection"
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Products
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover quality products from verified suppliers around the world
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>

        <div className="text-center mt-12">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors">
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;
