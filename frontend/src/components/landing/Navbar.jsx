import React, { useState, useEffect } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`
        w-full md:w-[80%] lg:w-[60%] 
        fixed top-[3%] left-[50%] transform -translate-x-[50%] 
        border border-slate-50 rounded-full 
        shadow-lg backdrop-blur-md z-50 
        transition-all duration-300 ease-in-out
        ${scrolled ? 'bg-black/50' : 'bg-transparent'}
      `}
    >
      <div className="px-4 md:px-6 py-2 md:py-3">
        <div className="flex items-center justify-between h-14 md:h-16">
          {/* Logo and Brand Section */}
          <div className="flex items-center space-x-2 md:space-x-3">
            <div className="flex items-center">
              <img 
                src="/ensemble-logo-1.svg" 
                alt="Ensemble Logo" 
                className="h-8 w-auto md:h-10 lg:h-12"
              />
            </div>
            <a 
              href="/" 
              className="text-2xl md:text-3xl lg:text-4xl font-semibold text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text animate-gradient transition-colors"
            >
              Ensemble
            </a>
          </div>

          {/* Hamburger Menu */}
          <button
            className="md:hidden p-2 rounded-lg bg-gray-800/80 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors"
            aria-label="Toggle Menu"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}
              />
            </svg>
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <a 
              href="/explore" 
              className="text-base lg:text-lg text-gray-300 hover:text-white transition-colors"
            >
              Explore
            </a>
            <a 
              href="/pricing" 
              className="text-base lg:text-lg text-gray-300 hover:text-white transition-colors"
            >
              Pricing
            </a>
            <a 
              href="/about" 
              className="text-base lg:text-lg text-gray-300 hover:text-white transition-colors"
            >
              About
            </a>
            <a 
              href="/login" 
              className="px-4 py-2 text-base lg:text-lg rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
            >
              Log in
            </a>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <div
          className={`
            md:hidden 
            absolute top-full left-0 
            w-full mt-2 
            bg-gray-900/95 backdrop-blur-md
            rounded-2xl border border-gray-700
            shadow-lg
            transform origin-top transition-all duration-200 ease-in-out
            ${isMenuOpen ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0'}
          `}
        >
          <div className="px-4 py-3 space-y-3">
            <a 
              href="/explore" 
              className="block text-lg text-gray-300 hover:text-white transition-colors py-2"
            >
              Explore
            </a>
            <a 
              href="/pricing" 
              className="block text-lg text-gray-300 hover:text-white transition-colors py-2"
            >
              Pricing
            </a>
            <a 
              href="/about" 
              className="block text-lg text-gray-300 hover:text-white transition-colors py-2"
            >
              About
            </a>
            <a 
              href="/login" 
              className="block text-lg text-center px-4 py-2 rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
            >
              Log in
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;