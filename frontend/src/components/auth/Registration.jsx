import { useEffect, useState } from 'react'
import Alert from './Alert';
import InputField from './InputField';
import {useDispatch,useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom';
import {registerUser} from '../../redux/slices/authSlice.js'
import { Loader, Lock, Mail, User } from 'lucide-react';

const Registration=()=>{
    const [formData,setFormData]=useState({
        firstName:'',
        lastName:'',
        email:'',
        password:'',
        confirmPassword:'',
        role:'user',
        acceptTerms:false
    }); 
    const [setAlert]=useState(null);
    const dispatch=useDispatch();
    const navigate=useNavigate();
    const {isLoading,error,isAuthenticated,user}=useSelector(state=>state.auth);

    useEffect(()=>{
        if(isAuthenticated && user && !user.isVerified){
            navigate('/verify-email');
        } else if (isAuthenticated && user && user.isVerified) {
            navigate('/dashboard');
        }
    },[isAuthenticated, user, navigate])

    const handleSubmit=async(e)=>{
        e.preventDefault();
        if(formData.password!==formData.confirmPassword){
            setAlert({type:'error',message:'Passwords do not match'})
            return;
        }
        dispatch(registerUser(formData))
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
                    {/* {alert && <Alert {...alert}/>} */}

                    {error && <Alert type="error" message={error} />}

                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <div className='grid grid-cols-2 gap-4'>
                            <InputField
                                icon={User}
                                type="text"
                                placeholder="First name"
                                value={formData.firstName}
                                onChange={(e)=>setFormData({...formData,firstName:e.target.value})}
                            />
                            <InputField
                                icon={User}
                                type="text"
                                placeholder="Last name"
                                value={formData.lastName}
                                onChange={(e)=>setFormData({...formData,lastName:e.target.value})}
                            />
                        </div>
                        <InputField
                            icon={Mail}
                            type="email"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={(e)=>setFormData({...formData,email:e.target.value})}
                        />
                        <InputField
                            icon={Lock}
                            type="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={(e)=>setFormData({...formData,password:e.target.value})}
                        />
                        <InputField
                            icon={Lock}
                            type="password"
                            placeholder="Confirm password"
                            value={formData.confirmPassword}
                            onChange={(e)=>setFormData({...formData,confirmPassword:e.target.value})}
                        />
                        {/* Role selection */}
                        <div className='space-y-2'>
                            <label className='text-sm text-gray-300 mb-1 block'>Account Type</label>
                            <div className='bg-gray-800/50 border border-gray-700 rounded-lg p-3 flex'>
                                <div className='flex items-center space-x-2 mr-4'>
                                    <input 
                                        type="radio"
                                        name="role"
                                        id="role-user"
                                        value="user"
                                        checked={formData.role === 'user'}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        className='w-4 h-4 text-purple-500 border-gray-700 focus:ring-purple-500'
                                    />
                                    <label htmlFor="role-user" className='text-sm text-gray-300'>
                                        Employee
                                    </label>
                                </div>
                                <div className='flex items-center space-x-2'>
                                    <input 
                                        type="radio"
                                        name="role"
                                        id="role-admin"
                                        value="admin"
                                        checked={formData.role === 'admin'}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        className='w-4 h-4 text-purple-500 border-gray-700 focus:ring-purple-500'
                                    />
                                    <label htmlFor="role-admin" className='text-sm text-gray-300'>
                                        Administrator
                                    </label>
                                </div>
                            </div>
                            <p className='text-xs text-gray-400 mt-1'>
                                Admins can create projects, manage members and workspaces
                            </p>
                        </div>
                        
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
                    <div className="my-4 text-center text-gray-400">OR</div>
                    <a
                        href="/api/auth/google"
                        className="w-full py-3 px-4 rounded-lg bg-white text-gray-700 border border-gray-300 font-medium hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9.18v3.48h4.79c-.2 1.13-.83 2.1-1.81 2.77v2.26h2.91c1.7-1.56 2.69-3.89 2.69-6.67z"/><path fill="#34A853" d="M9.18 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.83.86-2.96.86-2.28 0-4.22-1.54-4.91-3.61H1.27v2.33A8.96 8.96 0 009.18 18z"/><path fill="#FBBC05" d="M4.27 10.81c-.17-.54-.27-1.1-.27-1.68s.1-1.14.27-1.68V5.12H1.27a8.96 8.96 0 000 7.75L4.27 10.81z"/><path fill="#EA4335" d="M9.18 3.58c1.32 0 2.52.45 3.46 1.35l2.58-2.58A8.96 8.96 0 009.18 0a8.96 8.96 0 00-7.91 5.12l3 2.33c.69-2.07 2.63-3.61 4.91-3.61z"/></svg>
                        Continue with Google
                    </a>
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