import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        // Check if the token is provided
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided'
            });
        }

        // Log token for debugging
        console.log('Received token:', token);

        // Verify token
        console.log('JWT_SECRET:', process.env.JWT_SECRET); // Ensure the secret is loaded
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Log decoded token for debugging
        console.log('Decoded token:', decoded);

        // Check if the user exists
        const user = await User.findById(decoded.userId).select('-password');
        console.log('Found user:', user);

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }

        // Check user account status
        if (user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Account is not active'
            });
        }

        // Check if email is verified
        if (!user.email_verification.verified) {
            return res.status(401).json({
                success: false,
                message: 'Please verify your email address'
            });
        }

        req.user = user; // Attach the user to the request object
        next();
    } catch (error) {
        console.error('Protection error:', error); // Log the full error details
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
