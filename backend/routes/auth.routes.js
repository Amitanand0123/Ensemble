import express from 'express'
import { registerUser,loginUser,forgotPassword, verifyEmail, logoutUser, resetPassword } from '../controllers/authController.js'
import {protect} from '../middlewares/auth.js'
import { loginValidation, registerValidation, validateRequest } from '../middlewares/validation.js';


const router=express.Router();

router.post('/register',registerValidation,validateRequest,registerUser);
router.post('/login',loginValidation,validateRequest,loginUser)
router.post('/logout', protect, logoutUser); 
router.post('/forgot-password',forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/me',protect,(req,res)=>{
    res.json({user:req.user})
});

router.get('/verify-email/:token',verifyEmail);

export default router; 