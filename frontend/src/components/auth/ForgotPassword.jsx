import React, { useState } from 'react'
import { useDispatch,useSelector } from 'react-redux';
import { forgotPassword } from '../../redux/slices/authSlice'
import Alert from './Alert';
import InputField from './InputField';
import { Loader, Mail } from 'lucide-react';

const ForgotPassword=()=>{
    // const [email,setEmail]=useState('');
    // const [isLoading,setIsLoading]=useState(false);
    // const [alert,setAlert]=useState(null)

    // const handleSubmit=async(e)=>{
    //     e.preventDefault();
    //     setIsLoading(true);
    //     setAlert(null);

    //     try {
    //         const response=await fetch('/api/auth/forgot-password',{
    //             method:'POST',
    //             headers:{'Content-Type':'application/json'},
    //             body:JSON.stringify({email})
    //         })
    //         const data=await response.json();
    //         if(!response.ok){
    //             throw new Error(DataTransfer.message || 'Failed to send reset link');
    //         }
    //         setAlert({
    //             type:'success',
    //             message:'Password reset link has been sent to your email.'
    //         })
    //     } catch (error) {
    //         setAlert({type:'error',message:error.message})
    //     } finally{
    //         setIsLoading(false);
    //     }
    // }

    const [email,setEmail]=useState('');
    const dispatch=useDispatch();
    const {isLoading,error,message}=useSelector(state=>state.auth)

    const handleSubmit=async(e)=>{
        e.preventDefault()
        dispatchEvent(forgotPassword({email}))
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-black p-4'>
            <div className='max-w-md w-full space-y-8 relative'>
                <div className='absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse' />

                <div className='relative bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-8 shadow-xl animate-fade-in-up'>
                    <div className='text-center mb-8'>
                        <h2 className='text-3xl font-bold text-white mb-2'>Reset Password</h2>
                        <p className='text-gray-400'>Enter your email to receive a reset link</p>
                    </div>
                    {/* {alert && <Alert {...alert} />} */}
                    {error && <Alert type="error" message={error} />}
                    {message && <Alert type="success" message={message}/>}

                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <InputField 
                            icon={Mail}
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e)=>setEmail(e.target.value)}
                        />

                        <button
                            type="submit"
                            disabled={isLoading}
                            className='w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900'
                        >
                            {isLoading ? (
                                <Loader className='w-5 h-5 animate-spin mx-auto' />
                            ):(
                                'Send Reset Link'
                            )}
                        </button>
                    </form>
                    <p className='mt-6 text-center text-sm text-gray-400'>
                        Remember your password?{' '}
                        <a href="/login" className='text-purple-500 hover:text-purple-400 font-medium'>
                            Sign in
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default ForgotPassword;