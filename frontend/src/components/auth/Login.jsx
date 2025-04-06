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
    const {isLoading,error,isAuthenticated,isAdmin}=useSelector(state=>state.auth)

    // useEffect(() => {
    //     if(isAuthenticated) {
    //         navigate('/app/dashboard')  // Change from '/' to '/app/dashboard' per roadmap
    //     }
    // }, [isAuthenticated, navigate])

    useEffect(()=>{
        dispatch(clearError());
    },[dispatch])

    useEffect(()=>{
        if(isAuthenticated){
            if(isAdmin){
                navigate('/dashboard')
            }
            else{
                navigate('/')
            }
        }
    },[isAuthenticated,navigate,isAdmin])

    const handleChange=(e)=>{
        const {name,value,type,checked}=e.target
        setFormData(prev=>({
            ...prev,
            [name]:type==='checkbox'?checked:value 
        }))
    }

    const handleSubmit = async(e) => {
        e.preventDefault();
        try{
            await dispatch(loginUser(formData)).unwrap();
        } catch(error){
            console.log('Login failed:',error)
        }
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
                    <div className="my-4 text-center text-gray-400">OR</div>
                    <a
                        href="http://localhost:5000/api/auth/google" // Link directly to the backend route
                        className="w-full py-3 px-4 rounded-lg bg-white text-gray-700 border border-gray-300 font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                        {/* You can add a Google Icon here */}
                        <svg /* Google Icon SVG */ width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9.18v3.48h4.79c-.2 1.13-.83 2.1-1.81 2.77v2.26h2.91c1.7-1.56 2.69-3.89 2.69-6.67z"/><path fill="#34A853" d="M9.18 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.83.86-2.96.86-2.28 0-4.22-1.54-4.91-3.61H1.27v2.33A8.96 8.96 0 009.18 18z"/><path fill="#FBBC05" d="M4.27 10.81c-.17-.54-.27-1.1-.27-1.68s.1-1.14.27-1.68V5.12H1.27a8.96 8.96 0 000 7.75L4.27 10.81z"/><path fill="#EA4335" d="M9.18 3.58c1.32 0 2.52.45 3.46 1.35l2.58-2.58A8.96 8.96 0 009.18 0a8.96 8.96 0 00-7.91 5.12l3 2.33c.69-2.07 2.63-3.61 4.91-3.61z"/></svg>
                        Continue with Google
                    </a>
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
