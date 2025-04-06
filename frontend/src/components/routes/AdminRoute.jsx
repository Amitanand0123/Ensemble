// components/routes/AdminRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminRoute = ({ children }) => {
    const { isAuthenticated, user, isLoading } = useSelector(state => state.auth);
    const location = useLocation();

    if (isLoading) {
        // Optional: Add a proper loading indicator
        return <div>Checking admin status...</div>;
    }

    // Check if authenticated AND user is loaded AND user is admin
    if (!isAuthenticated || !user || user.role !== 'admin') {
        // Redirect them to the home page or dashboard if not an admin
        // state={{ from: location }} might be useful if you want to redirect back after login
        console.warn("Access denied: User is not an admin or not loaded.");
        return <Navigate to="/dashboard" replace />; // Redirect non-admins
    }

    // If authenticated and is an admin, render the child components
    return children;
};

export default AdminRoute;