import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import store from './redux/store';
import App from './App';
import './index.css';
import { Toaster } from 'react-hot-toast';
import axios from 'axios';

// Set the base URL for all Axios requests
axios.defaults.baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
// Ensure cookies are sent with cross-origin requests
axios.defaults.withCredentials = true;

// Set authorization header if token exists in local storage on initial load
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
      <Toaster 
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            border: '1px solid #713200',
            padding: '16px',
            color: '#FFFFFF',
            background: '#2D3748'
          },
        }}
      />
    </Provider>
  </React.StrictMode>
);