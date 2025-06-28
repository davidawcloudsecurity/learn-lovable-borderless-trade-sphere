
import React from 'react';
import { Button } from '@/components/ui/button';
import { Truck, Package, CreditCard } from 'lucide-react';

const Hero = () => {
  return (
    <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in">
            Global Commerce
            <span className="block text-blue-200">Made Simple</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 animate-fade-in">
            Connect with suppliers and buyers worldwide. Trade across borders with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
              Start Shopping
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600">
              Become a Seller
            </Button>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center animate-fade-in">
              <Truck className="h-12 w-12 mx-auto mb-4 text-blue-200" />
              <h3 className="text-lg font-semibold mb-2">Global Shipping</h3>
              <p className="text-blue-100">Fast delivery to 195+ countries worldwide</p>
            </div>
            <div className="text-center animate-fade-in">
              <Package className="h-12 w-12 mx-auto mb-4 text-blue-200" />
              <h3 className="text-lg font-semibold mb-2">Quality Assured</h3>
              <p className="text-blue-100">Verified suppliers and quality guarantee</p>
            </div>
            <div className="text-center animate-fade-in">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-blue-200" />
              <h3 className="text-lg font-semibold mb-2">Secure Payments</h3>
              <p className="text-blue-100">Multiple currencies and secure transactions</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
