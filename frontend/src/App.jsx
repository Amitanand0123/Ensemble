import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import Footer from './components/Footer';
import { Login, Registration, ForgotPassword, ResetPassword } from './components/auth/index';
import ProtectedRoute from './components/routes/ProtectedRoute';

const App = () => {
  return (
    <Router>
      <div className="bg-black text-white min-h-screen">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main>
          <Routes>
            {/* Home Route */}
            <Route
              path="/"
              element={
                <>
                  <HeroSection />
                  <Features />
                  <HowItWorks />
                  <Testimonials />
                </>
              }
            />

            {/* Authentication Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* Future Protected Route Example */}
            <Route
              path="/protected-page"
              element={
                <ProtectedRoute>
                  <h1>Protected Content</h1>
                </ProtectedRoute>
              }
            />
          </Routes>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </Router>
  );
};

export default App;
