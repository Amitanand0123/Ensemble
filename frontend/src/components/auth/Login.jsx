import { useEffect, useState } from 'react';
import InputField from './InputField';
import {useDispatch,useSelector} from 'react-redux'
import {useNavigate} from 'react-router-dom'
import {clearError, loginUser} from '../../redux/slices/authSlice.js'
import Alert from './Alert';
import { Loader, Lock, Mail} from 'lucide-react';

const Login = () => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const dispatch=useDispatch();
    const navigate=useNavigate();
    const {isLoading,error,isAuthenticated,isAdmin}=useSelector(state=>state.auth)

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
        <div className="min-h-screen flex bg-background">
            {/* Left Side - Content */}
            <div className="hidden lg:flex lg:w-1/2 bg-card/30 border-r border-border p-12 flex-col justify-center relative overflow-hidden">
                <div className="absolute inset-0 overflow-hidden">
                    <div className='absolute -right-20 top-20 w-80 h-80 bg-chart-1/10 rounded-full blur-3xl'/>
                    <div className='absolute bottom-20 -left-20 w-72 h-72 bg-chart-3/10 rounded-full blur-3xl'/>
                </div>
                <div className="max-w-md relative z-10">
                    <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent mb-6">Ensemble</h1>
                    <p className="text-2xl lg:text-3xl text-foreground mb-6 font-semibold">
                        Collaborate seamlessly with your team
                    </p>
                    <p className="text-base lg:text-lg text-muted-foreground leading-relaxed">
                        The all-in-one platform for project management, team communication, and productivity.
                    </p>
                </div>
            </div>

            {/* Right Side - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 lg:p-12">
                <div className="w-full max-w-md">
                    <div className="mb-8">
                        <h2 className="text-3xl lg:text-4xl font-bold text-foreground mb-2">Welcome Back</h2>
                        <p className="text-muted-foreground">Sign in to continue to Ensemble</p>
                    </div>

                    {error && <Alert type="error" message={error}/>}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <InputField
                            icon={Mail}
                            type="email"
                            name="email"
                            placeholder="Email address"
                            value={formData.email}
                            onChange={handleChange}
                        />
                        <InputField
                            icon={Lock}
                            type="password"
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <div className="flex items-center justify-between">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-border bg-input text-accent focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background"
                                    checked={formData.rememberMe}
                                    onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
                                />
                                <span className="ml-2 text-sm text-muted-foreground">Remember me</span>
                            </label>
                            <a href="/forgot-password" className="text-sm text-accent hover:text-accent/80 transition-colors font-medium">
                                Forgot Password?
                            </a>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3 px-4 rounded-lg bg-sidebar text-sidebar-text font-semibold hover:bg-sidebar-hover transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background shadow-lg hover:shadow-accent/30 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader className="w-5 h-5 animate-spin mx-auto" />
                            ) : (
                                'Sign In'
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

                    <p className="mt-8 text-center text-sm text-muted-foreground">
                        Don&apos;t have an account?{' '}
                        <a href="/register" className="text-accent hover:text-accent/80 font-semibold transition-colors">
                            Sign Up
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
