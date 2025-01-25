import React, { useState } from 'react'
import Alert from './Alert';
import InputField from './InputField';
import { Loader, Lock, Mail, User } from 'lucide-react';

const Registration=()=>{
    const [formData,setFormData]=useState({
        firstName:'',
        lastName:'',
        email:'',
        password:'',
        confirmPassword:'',
        acceptTerms:false
    });

    const[errors,setErrors]=useState({});
    const [isLoading,setIsLoading]=useState(false);
    const [alert,setAlert]=useState(null)

    const handleSubmit=async(e)=>{
        e.preventDefault();
        setIsLoading(true);
        setAlert(null);

        try {
            const response=await fetch('/api/auth/register',{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify(formData)
            })

            const data=await response.json();
            if(!response.ok){
                throw new Error(data.message || 'Registration failed');
            }

            setAlert({
                type:'success',
                message:'Registration successful! Please check your email to verify your account.'
            })

            setTimeout(()=>{
                window.location.href='/login';
            },2000)
        } catch (error) {
            setAlert({type:'error',message:error.message});
        } finally{
            setIsLoading(false);
        }
    }

    return (
        <div className='min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-black p-4'>
            <div className='max-w-md w-full space-y-8 relative'>
                <div className='absolute -top-40 -right-40 w-80 h-80 bg-pink-500/20 rounded-full blur-3xl animate-pulse'/>
                <div className='absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-700'/>

                <div className='relative bg-gray-900/50 backdrop-blur-xl rounded-2xl border-2xl border border-gray-700 p-8 shadow-xl animate-fade-in-up'>
                    <div className='text-center mb-8'>
                        <h2 className='text-3xl font-bold text-white mb-2'>Create Account</h2>
                        <p className='text-gray-400'>Join Ensemble and start collaborating</p>
                    </div>
                    {alert && <Alert {...alert}/>}
                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div className='grid grid-cols-2 gap-4'>
                            <InputField
                                icon={User}
                                type="text"
                                placeholder="First name"
                                value={formData.firstName}
                                onChange={(e)=>setFormData({...formData,firstName:e.target.value})}
                                error={errors.firstName}
                            />
                            <InputField
                                icon={User}
                                type="text"
                                placeholder="Last name"
                                value={formData.lastName}
                                onChange={(e)=>setFormData({...formData,lastName:e.target.value})}
                                error={errors.lastName}
                            />
                        </div>
                        <InputField
                            icon={Mail}
                            type="email"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={(e)=>setFormData({...formData,email:e.target.value})}
                            error={errors.email}
                        />
                        <InputField
                            icon={Lock}
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e)=>setFormData({...formData,password:e.target.value})}
                            error={errors.password}
                        />
                        <InputField
                            icon={Lock}
                            type="password"
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={(e)=>setFormData({...formData,confirmPassword:e.target.value})}
                            error={errors.confirmPassword}
                        />
                        <div className='flex items-start'>
                            <input 
                                type="checkbox"
                                className='mt-1 w-4 h-4 rounded border-gray-700 bg-gray-800 text-purple-500 focus:ring-purple-500'
                                checked={formData.acceptTerms}
                                onChange={(e)=>setFormData({...formData,acceptTerms:e.target.checked})}
                            />
                            <label className='ml-2 text-sm text-gray-400'>
                                I agree to the{' '}
                                <a href="/terms" className='text-purple-500 hover:text-purple-400'>
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="/privacy" className='text-purple-500 hover:text-purple-400'>
                                    Privacy Policy
                                </a>
                            </label>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className='w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2'
                        >
                            {isLoading?(
                                <Loader className='w-5 h-5 animate-spin mx-auto' />
                            ):(
                                'Create Account'
                            )}
                        </button>
                    </form>
                    <p className='mt-6 text-center text-sm text-gray-400'>
                        Already have an account?{' '}
                        <a href="/login" className='text-purple-500 hover:text-purple-400 font-medium'>
                            Sign In
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Registration;