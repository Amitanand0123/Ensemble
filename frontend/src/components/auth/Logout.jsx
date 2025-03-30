import React, { useEffect, useState } from 'react';
import InputField from './InputField';
import {useDispatch,useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {clearError, loginUser} from '../../redux/slices/authSlice.js'
import Alert from './Alert';
import { Loader, Lock, Mail } from 'lucide-react';

const Logout = () => {

    const dispatch=useDispatch();
    const navigate=useNavigate();
    const {isLoading,error,isAuthenticated}=useSelector(state=>state.auth)

    useEffect(()=>{
        dispatch(clearError());
    },[dispatch])
 
 
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

                    
                    <p className="mt-6 text-center text-sm text-gray-400">
                        Are you sure you want to logout
                        <button>Yes</button>
                        <button>No</button>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Logout;
