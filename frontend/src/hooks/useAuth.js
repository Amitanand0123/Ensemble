import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  forgotPassword,
} from '../redux/slices/authSlice.js';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error, message } = useSelector((state) => state.auth); 
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (storedToken !== token) { // This avoids unnecessary state updates (and re-renders) if they’re already the same.
      setToken(storedToken);
    }
  }, [isAuthenticated, token]);

  const handleLogin = async (credentials) => {
    try {
      const result = await dispatch(loginUser(credentials)).unwrap(); // unwrap : If the thunk fulfilled, it resolves to the actual payload (e.g. user data, token).
      return result;
    } catch (err) {
      console.error('Login error in hook:', err);
      throw err;
    }
  };
  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      setToken(null);
      navigate('/');
    } catch (err) {
      console.error('Logout error in hook:', err);
      throw err; 
    }
  };

  const handleRegister = async (userData) => {
    try {
      const result = await dispatch(registerUser(userData)).unwrap();
      return result;
    } catch (err) {
      console.error('Registration error in hook:', err);
      throw err; 
    }
  };

   const handleResetPassword = async ({ token, password }) => { 
    try {
      const result = await dispatch(resetPassword({ token, password })).unwrap();
      navigate('/login');
      return result;
    } catch (err) {
      console.error('Reset password error in hook:', err);
      throw err;
    }
  };

   const handleForgotPassword = async ({ email }) => { 
      try { 
          const result = await dispatch(forgotPassword({ email })).unwrap(); 
          return result;
      } catch (err) {
          console.error('Forgot password error in hook:', err);
          throw err;
      }
  };

  return {
    user,
    isAuthenticated,
    isLoading, 
    error, 
    message, 
    token, 
    login: handleLogin,
    logout: handleLogout, 
    register: handleRegister,
    resetPassword: handleResetPassword,
    forgotPassword: handleForgotPassword 
  };
};
