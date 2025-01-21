import React from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';

const App = () => {
  return (
    <div className="bg-black text-white min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <HeroSection />

        {/* Features Section */}
        <Features />

        {/* How It Works Section */}
        <HowItWorks />

        {/* Testimonials Section */}
        <Testimonials />

        {/* Footer */}
        <Footer />
      </main>
    </div>
  );
};

export default App;
