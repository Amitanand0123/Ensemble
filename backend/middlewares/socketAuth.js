import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export const verifySocketToken=async(socket,next)=>{
    const token=socket.handshake.auth.token
    try {
        const decoded=jwt.verify(token,process.env.JWT_SECRET)
        const user=await User.findById(decoded.userId)

        if(!user){
            return next(new Error('Authentication error'));
        }
        socket.user=user;
        next();
    } catch (error) {
        return next(new Error('Authentication error'))
    }
}