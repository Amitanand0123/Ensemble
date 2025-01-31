import { Navigate,useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute=({children})=>{
    const {isAuthenticated,isLoading}=useSelector(state=>state.auth)
    const location=useLocation()

    if(isLoading){
        return <div>Loading...</div>
    }
    if(!isAuthenticated){
        return <Navigate to="/login" state={{from:location}} replace />
    }
    return children;
}

export default ProtectedRoute;