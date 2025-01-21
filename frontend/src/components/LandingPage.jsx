import React from 'react'
import Features from "./Features";
import Footer from "./Footer";
import HowItWorks from "./HowItWorks";
import Testimonials from "./Testimonials";

const LandingPage = () => {
    return (
      <div className="bg-black">
        <Features />
        <HowItWorks />
        <Testimonials />
        <Footer />
      </div>
    );
  };
  
  export default LandingPage;