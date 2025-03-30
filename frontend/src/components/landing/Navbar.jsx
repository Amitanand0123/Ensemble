// --- START OF FILE Navbar.jsx ---

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux'; // Removed useDispatch as it's handled by the hook
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth'; // Corrected path assuming structure

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // Use the custom hook to get auth state and handler functions
  const { isAuthenticated, logout } = useAuth(); // <-- Destructure 'logout'
  const navigate = useNavigate(); // Keep navigate if needed for other links

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setScrolled(offset > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handler to call the logout function from the useAuth hook
  const confirmLogout = async () => { // <-- Make async
    try {
      await logout(); // <-- Call the 'logout' function from the hook
      setShowLogoutPopup(false);
      // navigate('/'); // Navigation is already handled within the useAuth hook's logout function
    } catch (error) {
      console.error("Logout failed in Navbar:", error);
      // Optionally: show an error message to the user
      setShowLogoutPopup(false); // Close popup even on error
    }
  };

  // Handler for the logout button/link click
  const handleLogoutClick = (e) => {
    e.preventDefault(); // Prevent default link behavior if it's an <a> tag
    setShowLogoutPopup(true);
  };

  return (
    <>
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
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8 gap-4">
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
              {isAuthenticated ? (
                <a
                  href="#" // Use href="#" or button for accessibility if it only triggers an action
                  onClick={handleLogoutClick} // <-- Use the intermediate handler
                  className="cursor-pointer px-4 py-2 text-base lg:text-lg rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
                >
                  Log out
                </a>
              ) : (
                <a
                  href="/login"
                  className="px-4 py-2 text-base lg:text-lg rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
                >
                  Log in
                </a>
              )}
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
                onClick={() => setIsMenuOpen(false)} // Close menu on click
              >
                Explore
              </a>
              <a
                href="/pricing"
                className="block text-lg text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)} // Close menu on click
              >
                Pricing
              </a>
              <a
                href="/about"
                className="block text-lg text-gray-300 hover:text-white transition-colors py-2"
                onClick={() => setIsMenuOpen(false)} // Close menu on click
              >
                About
              </a>
              {isAuthenticated ? (
                <button
                  onClick={() => { handleLogoutClick(); setIsMenuOpen(false); }} // <-- Use handler & close menu
                  className="block w-full text-lg text-center px-4 py-2 rounded-full bg-red-600 text-white hover:bg-red-500 transition-colors"
                >
                  Logout
                </button>
              ) : (
                <a
                  href="/login"
                  className="block text-lg text-center px-4 py-2 rounded-full bg-white text-black hover:bg-gray-200 transition-colors"
                  onClick={() => setIsMenuOpen(false)} // Close menu on click
                >
                  Log in
                </a>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Logout Confirmation Popup (remains the same) */}
      {showLogoutPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-[90%] max-w-sm text-center">
            <h2 className="text-xl font-semibold">Confirm Logout</h2>
            <p className="mt-2 text-gray-300">Are you sure you want to log out?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={confirmLogout} // <-- Calls the correct async handler
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-md"
              >
                Yes, Logout
              </button>
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="px-4 py-2 bg-gray-500 hover:bg-gray-400 text-white rounded-md"
              >
                No, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
// --- END OF FILE Navbar.jsx ---