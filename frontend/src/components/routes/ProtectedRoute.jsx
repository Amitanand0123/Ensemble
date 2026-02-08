import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import PropTypes from 'prop-types';

const ProtectedRoute=({children})=>{
    const {isAuthenticated,isLoading}=useSelector(state=>state.auth)
    const location=useLocation()

    if(isLoading){
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if(!isAuthenticated){
        return <Navigate to="/login" state={{from:location}} replace />
    }

    return children;
}

ProtectedRoute.propTypes={
    children:PropTypes.node
}

export default ProtectedRoute;