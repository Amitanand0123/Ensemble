import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import PropTypes from 'prop-types';

const AdminRoute = ({ children }) => {
    const { isAuthenticated, user, isLoading } = useSelector(state => state.auth);
    const location = useLocation();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
            </div>
        );
    }

    if (!isAuthenticated || !user || user.role !== 'admin') {
        console.warn("Access denied: User is not an admin or not authenticated.");
        
        return <Navigate to="/dashboard" state={{ from: location }} replace />;
    }

    return children;
};

AdminRoute.propTypes={
    children:PropTypes.node
}

export default AdminRoute;