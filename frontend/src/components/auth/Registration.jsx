import { useEffect, useState } from 'react'
import Alert from './Alert';
import InputField from './InputField';
import {useDispatch,useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom';
import {registerUser} from '../../redux/slices/authSlice.js'
import { Loader, Lock, Mail, User} from 'lucide-react';

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
    const [alert,setAlert]=useState(null);
    const dispatch=useDispatch();
    const navigate=useNavigate();
    const {isLoading,error,isAuthenticated,user}=useSelector(state=>state.auth);

    useEffect(()=>{
        if(isAuthenticated && user) {
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
        <div className='min-h-screen flex bg-background'>
            {/* Left Side - Content */}
            <div className="hidden lg:flex lg:w-1/2 bg-card/30 border-r border-border p-12 flex-col justify-center relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className='absolute -right-20 top-20 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse'/>
                    <div className='absolute bottom-20 -left-20 w-72 h-72 bg-secondary/10 rounded-full blur-3xl animate-pulse'/>
                </div>
                <div className="max-w-md relative z-10 ml-16">
                    <h1 className="text-5xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-6">Join Ensemble</h1>
                    <p className="text-2xl text-foreground mb-8 font-semibold">
                        Start collaborating with your team today
                    </p>
                    <p className="text-lg text-muted-foreground mb-12 leading-relaxed">
                        Get started in minutes. No credit card required. Join thousands of teams already using Ensemble.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className='w-full lg:w-1/2 flex items-center justify-center p-8'>
                <div className='w-full max-w-md'>
                    <div className='mb-8'>
                        <h2 className='text-3xl font-bold text-foreground mb-2'>Create Account</h2>
                    </div>

                    {alert && <Alert type="error" message={error} />}

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
                            <label className='text-sm text-foreground mb-1 block font-medium'>Account Type</label>
                            <div className='bg-card/80 border-2 border-border rounded-lg p-3 flex'>
                                <div className='flex items-center space-x-2 mr-4'>
                                    <input
                                        type="radio"
                                        name="role"
                                        id="role-user"
                                        value="user"
                                        checked={formData.role === 'user'}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                        className='w-4 h-4 text-accent border-border focus:ring-2 focus:ring-accent'
                                    />
                                    <label htmlFor="role-user" className='text-sm text-foreground cursor-pointer'>
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
                                        className='w-4 h-4 text-accent border-border focus:ring-2 focus:ring-accent'
                                    />
                                    <label htmlFor="role-admin" className='text-sm text-foreground cursor-pointer'>
                                        Administrator
                                    </label>
                                </div>
                            </div>
                            <p className='text-xs text-muted-foreground mt-1'>
                                Admins can create projects, manage members and workspaces
                            </p>
                        </div>
                        
                        <div className='flex items-start'>
                            <input
                                type="checkbox"
                                className='mt-1 w-4 h-4 rounded border-border bg-input text-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background'
                                checked={formData.acceptTerms}
                                onChange={(e)=>setFormData({...formData,acceptTerms:e.target.checked})}
                            />
                            <label className='ml-2 text-sm text-muted-foreground'>
                                I agree to the{' '}
                                <a href="/terms" className='text-accent hover:text-accent/80 transition-colors font-medium'>
                                    Terms of Service
                                </a>{' '}
                                and{' '}
                                <a href="/privacy" className='text-accent hover:text-accent/80 transition-colors font-medium'>
                                    Privacy Policy
                                </a>
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className='w-full py-3 px-4 rounded-lg bg-sidebar text-sidebar-text font-semibold hover:bg-sidebar-hover transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background shadow-lg hover:shadow-accent/30 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {isLoading?(
                                <Loader className='w-5 h-5 animate-spin mx-auto' />
                            ):(
                                'Create Account'
                            )}
                        </button>
                    </form>

                    <div className="my-6 flex items-center">
                        <div className="flex-1 border-t border-border"></div>
                        <span className="px-4 text-sm text-muted-foreground">OR</span>
                        <div className="flex-1 border-t border-border"></div>
                    </div>

                    <a
                        href={`${import.meta.env.VITE_API_BASE_URL}/api/auth/google`}
                        className="w-full py-3 px-4 rounded-lg bg-card border-2 border-border text-foreground font-medium hover:bg-accent/10 hover:border-accent/50 transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg"><path fill="#4285F4" d="M17.64 9.2c0-.63-.06-1.25-.16-1.84H9.18v3.48h4.79c-.2 1.13-.83 2.1-1.81 2.77v2.26h2.91c1.7-1.56 2.69-3.89 2.69-6.67z"/><path fill="#34A853" d="M9.18 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.8.54-1.83.86-2.96.86-2.28 0-4.22-1.54-4.91-3.61H1.27v2.33A8.96 8.96 0 009.18 18z"/><path fill="#FBBC05" d="M4.27 10.81c-.17-.54-.27-1.1-.27-1.68s.1-1.14.27-1.68V5.12H1.27a8.96 8.96 0 000 7.75L4.27 10.81z"/><path fill="#EA4335" d="M9.18 3.58c1.32 0 2.52.45 3.46 1.35l2.58-2.58A8.96 8.96 0 009.18 0a8.96 8.96 0 00-7.91 5.12l3 2.33c.69-2.07 2.63-3.61 4.91-3.61z"/></svg>
                        Continue with Google
                    </a>

                    <p className='mt-8 text-center text-sm text-muted-foreground'>
                        Already have an account?{' '}
                        <a href="/login" className='text-accent hover:text-accent/80 font-semibold transition-colors'>
                            Sign In
                        </a>
                    </p>
                </div>
            </div>
        </div>
    )
}

export default Registration;