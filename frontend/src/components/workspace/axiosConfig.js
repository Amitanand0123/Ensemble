import axios from 'axios';
import store from '../store';

const setupAxiosInterceptors = () => {
    axios.interceptors.request.use(
        (config) => {
            const state = store.getState();
            const token = state.auth.token;
            
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
            
            config.baseURL = process.env.REACT_APP_API_URL;
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    axios.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                store.dispatch({ type: 'auth/logout' });
            }
            return Promise.reject(error);
        }
    );
};

export default setupAxiosInterceptors;