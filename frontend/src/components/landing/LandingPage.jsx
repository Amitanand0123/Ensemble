import Hero from "./Hero";
import Features from "./Features";
import HowItWorks from "./HowItWorks";
import Testimonials from "./Testimonials";
import Pricing from './Pricing';

const LandingPage = () => {
    return (
      <div className="bg-background">
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing/>
        <Testimonials />
      </div>
    );
  };
  
  export default LandingPage;