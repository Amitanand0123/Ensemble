import {useState} from 'react'
import { useDispatch,useSelector } from 'react-redux'
import { resetPassword } from '../../redux/slices/authSlice'
import Alert from './Alert';
import InputField from './InputField';
import { Loader, Lock} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

const ResetPassword=()=>{
    const [password,setPassword]=useState('');
    const [confirmPassword,setConfirmPassword]=useState('');
    const {token}=useParams()
    const dispatch=useDispatch()
    const navigate=useNavigate()
    const {isLoading,error,message}=useSelector(state=>state.auth)

    const handleSubmit=async(e)=>{
        e.preventDefault();
        if(password!==confirmPassword){
            return;
        }
        const result=await dispatch(resetPassword({token,password}))
        if(!result.error){
            setTimeout(()=> navigate('/login'),2000)
        }
    }


    return(
        <div className='min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden'>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className='absolute -right-40 top-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse'/>
                <div className='absolute bottom-20 -left-40 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse'/>
            </div>
            <div className='max-w-md w-full space-y-8 relative z-10'>
                <div className='relative bg-card/80 backdrop-blur-xl rounded-2xl border-2 border-border p-8 shadow-2xl hover:shadow-accent/10 transition-all'>
                    <div className='text-center mb-8'>
                        <h2 className='text-3xl font-bold text-foreground mb-2'>Reset Password</h2>
                        <p className='text-muted-foreground'>Enter your new password</p>
                    </div>

                    {error && <Alert type="error" message={error} />}
                    {message && <Alert type="success" message={message} />}

                    <form onSubmit={handleSubmit} className='space-y-6'>
                        <InputField 
                            icon={Lock}
                            type="password"
                            placeholder="New Password"
                            value={password}
                            onChange={(e)=>setPassword(e.target.value)}
                        />
                        <InputField 
                            icon={Lock}
                            type="password"
                            placeholder="Confirm new Password"
                            value={confirmPassword}
                            onChange={(e)=>setConfirmPassword(e.target.value)}
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className='w-full py-3 px-4 rounded-lg bg-sidebar text-sidebar-text font-semibold hover:bg-sidebar-hover transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 focus:ring-offset-background shadow-lg hover:shadow-accent/30 disabled:opacity-50 disabled:cursor-not-allowed'
                        >
                            {isLoading?(
                                <Loader className='w-5 h-5 animate-spin mx-auto' />
                            ):(
                                'Reset Password'
                            )}
                        </button> 
                        
                    </form>
                </div>
            </div>
        </div>
    )
}

export default ResetPassword;