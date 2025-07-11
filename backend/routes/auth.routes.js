import express from 'express'
import { registerUser,loginUser,forgotPassword, verifyEmail, logoutUser, resetPassword, resendVerificationEmail } from '../controllers/authController.js'
import {protect} from '../middlewares/auth.js'
import { loginValidation, registerValidation, validateRequest } from '../middlewares/validation.js';
import passport from 'passport';
import jwt from 'jsonwebtoken';


const router=express.Router(); 

router.post('/register',registerValidation,validateRequest,registerUser);
router.post('/login',loginValidation,validateRequest,loginUser)
router.post('/logout', protect, logoutUser); 
router.post('/forgot-password',forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me',protect,(req,res)=>{
    res.json({user:req.user})
});

router.post('/verify-email',verifyEmail);
router.post('/resend-verification', resendVerificationEmail);

router.get('/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
)
router.get('/google/callback',
    passport.authenticate('google',{ //Uses Passport’s google strategy to process the OAuth callback.
        failureRedirect:`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=google-auth-failed`,
        failureMessage:true,
        session:false
    }),
    (req,res)=>{
        if(!req.user){
            return res.redirect(`${process.env.FRONTEND_URL}/login?error=authentication-failed`)
        }
        try {
            if(!req.user || !req.user._id || !req.user.email){
                console.error("Google Callback: req.user object is missing required properties",JSON.stringify(req.user))
                throw new Error("User data from Google authentication is incomplete.")
            }
            const accessToken=jwt.sign(
                {userId:req.user._id,role:req.user.role,email:req.user.email}, // This is the payload — the data inside the token.
                process.env.JWT_SECRET,
                {expiresIn:'1d'}
            )
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/auth/callback?token=${accessToken}`) // fix
        } catch (error) {
            console.error("Error generating token or redirecting: ",error);
            res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}/login?error=token-generation-failed`) // fix
        }
    }
)

export default router;