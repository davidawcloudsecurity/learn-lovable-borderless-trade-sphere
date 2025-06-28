
import React from 'react';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import CategorySection from '@/components/CategorySection';
import ProductGrid from '@/components/ProductGrid';
import GlobalStats from '@/components/GlobalStats';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <Hero />
      <CategorySection />
      <ProductGrid />
      <GlobalStats />
      <Footer />
    </div>
  );
};

export default Index;
