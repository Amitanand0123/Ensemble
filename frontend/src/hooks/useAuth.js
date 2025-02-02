import {useState,useEffect} from 'react'
import { useDispatch,useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {login,logout,register,resetPassword,updateProfile} from '../redux/slices/authSlice.js'

export const useAuth=()=>{
    const dispatch=useDispatch()
    const navigate=useNavigate()
    const {user,isAuthenticated,loading,error}=useSelector((state)=>state.auth)
    const [token,setToken]=useState(localStorage.getItem('token'))

    useEffect(()=>{
        if(token){
            localStorage.setItem('token',token)
        }
        else{
            localStorage.removeItem('token')
        }
    },[token])

    const handleLogin=async(credentials)=>{
        try {
            const result=await dispatch(login(credentials)).unwrap()
            setToken(result.token)
            navigate('/dashboard')
            return result
        } catch (error) {
            console.error('Login error:',error)
        }
    }

    const handleLogout=async()=>{
        await dispatch(logout())
        setToken(null)
        navigate('/')
    }

    const  handleRegister=async(userData)=>{
        try {
            const result=await dispatch(register(userData)).unwrap();
            setToken(result.token)
            navigate('/dashboard')
            return result
        } catch (error) {
            console.error('Registration error:',error)
        }
    }

    const handleResetPassword=async(email)=>{
        try {
            await dispatch(resetPassword(email))
        } catch (error) {
            console.error('Reset password error:',error)
        }
    }

    const handleUpdateProfile=async(profileData)=>{
        try {
            const result=await dispatch(updateProfile(profileData)).unwrap()
            return result
        } catch (error) {
            console.error('Update profile error:',error)
        }
    }
    return {user,isAuthenticated,loading,error,token,login:handleLogin,logout:handleLogout,register:handleRegister,resetPassword:handleResetPassword,updateProfile:handleUpdateProfile}
}
