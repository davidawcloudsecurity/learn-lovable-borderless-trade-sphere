
import React from 'react';
import { Globe, Users, Package, Truck } from 'lucide-react';

const GlobalStats = () => {
  const stats = [
    {
      icon: <Globe className="h-8 w-8" />,
      number: "195+",
      label: "Countries Served",
      color: "text-blue-600"
    },
    {
      icon: <Users className="h-8 w-8" />,
      number: "2M+",
      label: "Active Buyers",
      color: "text-green-600"
    },
    {
      icon: <Package className="h-8 w-8" />,
      number: "500K+",
      label: "Products Listed",
      color: "text-purple-600"
    },
    {
      icon: <Truck className="h-8 w-8" />,
      number: "50M+",
      label: "Orders Delivered",
      color: "text-orange-600"
    }
  ];

  return (
    <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Connecting the World Through Trade
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Join millions of businesses and consumers in the world's largest global marketplace
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center group">
              <div className={`${stat.color} mb-4 flex justify-center group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <div className="text-3xl md:text-4xl font-bold mb-2">{stat.number}</div>
              <div className="text-gray-300">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default GlobalStats;
