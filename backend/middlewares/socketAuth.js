import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const verifySocketToken = async (socket, next) => {
    console.log("[Socket Auth] Verifying new socket connection...");
    const token = socket.handshake.auth.token; // When a client connects via Socket.IO, it sends extra data via the handshake object.
    // Here, we expect a JWT token to be present in socket.handshake.auth.token
    if (!token) {
        console.error("[Socket Auth] ❌ Error: No token provided in handshake. Connection rejected.");
        return next(new Error('Authentication error: No token provided.'));
    }
    console.log(`[Socket Auth] Token received: ${token.substring(0, 15)}...`);
    try {
        console.log("[Socket Auth] Attempting to verify JWT...");
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("[Socket Auth] ✅ Token verified successfully. Decoded payload:", decoded);
        console.log(`[Socket Auth] Finding user with ID: ${decoded.userId}`);
        const user = await User.findById(decoded.userId);
        if (!user) {
            console.error(`[Socket Auth] ❌ Error: User with ID ${decoded.userId} not found in database. Connection rejected.`);
            return next(new Error('Authentication error: User not found.'));
        }
        console.log(`[Socket Auth] ✅ User ${user.email} found. Attaching to socket. Connection allowed.`);
        socket.user = user; // Once socket.user is set, you can access the logged-in user in any other socket event handlers without needing to decode the token again.
        next(); 
    } catch (error) {
        console.error("[Socket Auth] ❌ JWT verification failed:", error.message);
        return next(new Error('Authentication error: Invalid token.'));
    }
};