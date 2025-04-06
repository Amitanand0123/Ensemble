import { useEffect } from "react";
import { useLocation,useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import { loginUser } from "../../redux/slices/authSlice";

const AuthCallback=()=>{
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    useEffect(()=>{
        const queryParams=new URLSearchParams(location.search);
        const token=queryParams.get('token');
        const error=queryParams.get('error');
        const handleAuth=async(authToken)=>{
            try {
                console.log("Recieved token on frontend:",authToken);
                localStorage.setItem('token',authToken);
                axios.defaults.headers.common['Authorization'] = `Bearer ${authToken}`;
                const response=await axios.get('http://localhost:5000/api/auth/me')
                if(response.data && response.data.user){
                    console.log("User data fetched:",response.data.user);
                    dispatch({
                        type:'auth/login/fulfilled',
                        payload:{
                            success:true,
                            accessToken:authToken,
                            user:response.data.user
                        }
                    })
                    navigate('/dashboard')
                }
                else{
                    throw new Error('Failed to fetch user data after OAuth.')
                }
            } catch (error) {
                console.error("Error fetching user data after OAuth:",error)
                localStorage.removeItem('token')
                delete axios.defaults.headers.common['Authorization']
                navigate('/login?error=oauth-fetch-failed')
            }
        }
        if(token){
            handleAuth(token)
        } else if(error){
            console.error("OAuth Error:",error)
            navigate(`/login?error=${error || 'oauth-failed'}`)
        }
        else{
            navigate('/login?error=unknown-oauth-issue')
        }
    },[location,navigate,dispatch])

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
            Processing authentication... Please wait.
        </div>
    )
}
export default AuthCallback;