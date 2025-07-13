
import React from 'react';

const CategorySection = () => {
  const categories = [
    {
      name: "Electronics",
      image: "photo-1498049794561-7780e7231661",
      count: "10,000+ products"
    },
    {
      name: "Fashion & Apparel",
      image: "photo-1445205170230-053b83016050",
      count: "25,000+ products"
    },
    {
      name: "Home & Garden",
      image: "photo-1586023492125-27b2c045efd7",
      count: "15,000+ products"
    },
    {
      name: "Sports & Outdoors",
      image: "photo-1571019613454-1cb2f99b2d8b",
      count: "8,000+ products"
    },
    {
      name: "Health & Beauty",
      image: "photo-1658247412403-f0459cb062b9",
      count: "12,000+ products"
    },
    {
      name: "Automotive",
      image: "photo-1492144534655-ae79c964c9d7",
      count: "6,000+ products"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Shop by Category
          </h2>
          <p className="text-lg text-gray-600">
            Explore millions of products across all major categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="aspect-square">
                <img
                  src={`/assets/images/${category.image}`}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-300"></div>
                <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center p-4">
                  <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                  <p className="text-sm opacity-90">{category.count}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
