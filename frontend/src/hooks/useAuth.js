// --- START OF FILE useAuth.js ---

import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  loginUser,
  logoutUser, // <-- Import the action creator
  registerUser,
  resetPassword,
  // forgotPassword, // You might need this if you add a forgot password flow trigger
} from '../redux/slices/authSlice.js'; // Ensure path is correct

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error, message } = useSelector((state) => state.auth); // Corrected loading/error access
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // This effect should probably just sync the token state with Redux/localStorage
    // rather than setting localStorage directly, which might cause race conditions.
    // Let Redux handle localStorage updates.
    const storedToken = localStorage.getItem('token');
    if (storedToken !== token) {
        setToken(storedToken);
    }
  }, [isAuthenticated]); // Re-run when auth state changes

  const handleLogin = async (credentials) => {
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      // setToken(result.accessToken); // Redux state handles token now via localStorage sync
      navigate('/dashboard'); // Or wherever you want to redirect after login
      return result;
    } catch (err) {
      console.error('Login error in hook:', err);
      // Don't navigate on error, the component might show the error message
      throw err; // Re-throw for the component to potentially handle
    }
  };

  const handleLogout = async () => { // <-- This is the function the Navbar calls via 'logout'
    try {
      await dispatch(logoutUser()).unwrap(); // <-- Dispatches the imported action creator
      setToken(null); // Clear local hook state
      navigate('/'); // Navigate after successful logout
    } catch (err) {
      console.error('Logout error in hook:', err);
      throw err; // Re-throw for the component
    }
  };

  const handleRegister = async (userData) => {
    try {
      const result = await dispatch(registerUser(userData)).unwrap();
      // setToken(result.accessToken); // Redux state handles token
      navigate('/dashboard'); // Or maybe '/verify-email-prompt'
      return result;
    } catch (err) {
      console.error('Registration error in hook:', err);
      throw err; // Re-throw
    }
  };

  // ... (handleResetPassword etc. - keeping existing ones for brevity)
   const handleResetPassword = async ({ token, password }) => { // Reset needs token and password
    try {
      // Assuming resetPassword action takes { token, password }
      const result = await dispatch(resetPassword({ token, password })).unwrap();
      // Maybe navigate to login page after successful reset
      navigate('/login');
      return result;
    } catch (err) {
      console.error('Reset password error in hook:', err);
      throw err;
    }
  };

   const handleForgotPassword = async ({ email }) => { // Forgot password needs email
      try {
          // Ensure you have forgotPassword imported and dispatched correctly
          // Assuming forgotPassword action takes { email }
          // import { forgotPassword } from '../redux/slices/authSlice.js';
          // const result = await dispatch(forgotPassword({ email })).unwrap();
          // You might not navigate here, just show a success message from Redux state
          // return result;
          console.warn("handleForgotPassword needs to dispatch the actual forgotPassword action");
      } catch (err) {
          console.error('Forgot password error in hook:', err);
          throw err;
      }
  };


  return {
    user,
    isAuthenticated,
    isLoading, // Use isLoading from Redux state
    error, // Use error from Redux state
    message, // Use message from Redux state
    token, // Keep local token state if needed, but Redux is the source of truth
    login: handleLogin,
    logout: handleLogout, // <-- Export the handler function as 'logout'
    register: handleRegister,
    // Add other handlers as needed
    resetPassword: handleResetPassword,
    forgotPassword: handleForgotPassword // If implemented
  };
};
// --- END OF FILE useAuth.js ---