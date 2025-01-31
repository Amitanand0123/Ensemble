import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const protect = async(req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided'
            });
        }

        if(!token) {
            return res.status(401).json({
                success: false,
                message: 'Access denied. No token provided'
            });
        }

        console.log('JWT_SECRET:', process.env.JWT_SECRET); // Check if secret is loaded
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token:', decoded);

        const user = await User.findById(decoded.userId)
            .select('-password')
        console.log('Found user:', user);

        if(!user) {
            return res.status(401).json({
                success: false,
                message: 'user not found'
            });
        }

        if(user.status !== 'active') {
            return res.status(401).json({
                success: false,
                message: 'Account is not active'
            });
        }
        req.user = user;

        if(!user.email_verification.verified) {
            return res.status(401).json({
                success: false,
                message: 'Please verify your email address'
            })
        }

        next();
    } catch(error) {
        console.error('Protection error:', error); // Log the full error
        return res.status(401).json({
            success: false,
            message: 'Invalid token',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const authorize = (...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return res.status(403).json({
                success:false,
                message:'Not authorizaed to access this route'
            })
        }
        next();
    }
}