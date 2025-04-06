import React from 'react'
import Hero from "./Hero";
import Features from "./Features";
import Footer from "./Footer";
import HowItWorks from "./HowItWorks";
import Testimonials from "./Testimonials";
import Pricing from './Pricing';

const LandingPage = () => {
    return (
      <div className="bg-black">
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing/>
        <Testimonials />
      </div>
    );
  };
  
  export default LandingPage;