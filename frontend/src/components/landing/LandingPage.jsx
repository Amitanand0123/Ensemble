import React from 'react'
import Hero from "./Hero";
import Features from "./Features";
import Footer from "./Footer";
import HowItWorks from "./HowItWorks";
import Testimonials from "./Testimonials";

const LandingPage = () => {
    return (
      <div className="bg-black">
        <Hero />
        <Features />
        <HowItWorks />
        <Testimonials />
      </div>
    );
  };
  
  export default LandingPage;