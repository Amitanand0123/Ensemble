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
        <div className='min-h-screen flex-items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-black p-4'>
            <div className='max-w-md w-full space-y-8 relative'>
                <div className='absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse' />

                <div className='relative bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-gra-700 p-8 shadow-xl animate-fade-in-up'>
                    <div className='text-center mb-8'>
                        <h2 className='text-3xl font-bold text-white mb-2'>Reset Password</h2>
                        <p className='text-gray-400'>Enter your new password</p>
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
                            className='w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-medium hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900'
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