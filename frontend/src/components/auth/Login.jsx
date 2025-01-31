import React, { useEffect, useState } from 'react';
import InputField from './InputField';
import {useDispatch,useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {clearError, loginUser} from '../../redux/slices/authSlice.js'
import Alert from './Alert';
import { Loader, Lock, Mail } from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });

    // const [errors, setErrors] = useState({});
    // const [isLoading, setIsLoading] = useState(false);
    // const [alert, setAlert] = useState(null);

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     setIsLoading(true);
    //     setAlert(null);

    //     try {
    //         const response = await fetch('/api/auth/login', {
    //             method: 'POST',
    //             headers: { 'Content-Type': 'application/json' },
    //             body: JSON.stringify(formData)
    //         });

    //         const data = await response.json();

    //         if (!response.ok) {
    //             throw new Error(data.message || 'Login failed');
    //         }

    //         // Redirect on successful login
    //         window.location.href = '/dashboard';
    //     } catch (error) {
    //         setAlert({ type: 'error', message: error.message });
    //     } finally {
    //         setIsLoading(false);
    //     }
    // };

    const dispatch=useDispatch();
    const navigate=useNavigate();
    const {isLoading,error,isAuthenticated}=useSelector(state=>state.auth)

    // useEffect(()=>{
    //     if(isAuthenticated){
    //         navigate('/')
    //     }
    // },[isAuthenticated,navigate])

    useEffect(()=>{
        dispatch(clearError());
    },[dispatch])

    const handleChange=(e)=>{
        const {name,value,type,checked}=e.target
        setFormData(prev=>({
            ...prev,
            [name]:type==='checkbox'?checked:value 
        }))
    }

    const handleSubmit=async(e)=>{
        e.preventDefault();
        dispatch(loginUser(formData))
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-black p-4">
            <div className="max-w-md w-full space-y-8 relative">
                {/* Background circles */}
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700" />

                <div className="relative bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-8 shadow-xl animate-fade-in-up">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back</h2>
                        <p className="text-gray-400">Sign in to continue to Ensemble</p>
                    </div>

                    {/* Display alert if there's an error */}
                    {/* {alert && <Alert type={alert.type} message={alert.message} />} */}
                    {error && <Alert type="error" message={error}/>}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <InputField
                            icon={Mail}
                            type="email"
                            name="email"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                            // error={errors.email}
                        />
                        <InputField
                            icon={Lock}
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}                            // error={errors.password}
                        />
                        <div className="flex items-center justify-between">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-500 focus:ring-purple-500"
                                    checked={formData.rememberMe}
                                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                                />
                                <span className="ml-2 text-sm text-gray-400">Remember me</span>
                            </label>
                            <a href="/forgot-password" className="text-sm text-purple-500 hover:text-purple-400">
                                Forgot Password?
                            </a>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-offset-2 focus:ring-offset-gray-900"
                        >
                            {isLoading ? (
                                <Loader className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-400">
                        Don't have an account?{' '}
                        <a href="/register" className="text-purple-500 hover:text-purple-400 font-medium">
                            Sign Up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
