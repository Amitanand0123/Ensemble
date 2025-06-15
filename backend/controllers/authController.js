import User from '../models/User.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import crypto from 'crypto'
import sendEmail from '../utils/sendEmail.js'
import { validationResult } from 'express-validator'

dotenv.config() 

const JWT_SECRET=process.env.JWT_SECRET;
const JWT_REFRESH_SECRET=process.env.JWT_REFRESH_SECRET;

const generateTokens = (user) =>{
    const accessToken=jwt.sign(  
        {
            userId:user._id, 
            role:user.role,
            email:user.email
        },
        JWT_SECRET,
        {
            expiresIn:'1d'
        }
    );

    const refreshToken=jwt.sign(
        {
            userId:user._id
        },
        JWT_REFRESH_SECRET,
        {
            expiresIn:'7d'
        }
    );

    return { accessToken,refreshToken}
}

export const registerUser = async(req,res)=>{
    try{
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }
        const {firstName,lastName,email,password,role}=req.body
        const userExists=await User.findOne({
            email:{$regex:new RegExp(`^${email}$`,'i')} 
        });

        if(userExists){
            return res.status(400).json({
                success:false,
                message:'Email already registered'
            })
        }

        const allowedRoles=['admin','user','moderator'];
        const userRole=role && allowedRoles.includes(role) ? role : 'user';

        const user=new User({
            name:{
                first:firstName.trim(),
                last:lastName.trim()
            },
            email:email.toLowerCase(),
            password,
            role:userRole,
        });

        await user.save();

        try{
            await sendVerificationEmail(user);
        }catch(error){
            console.error('Error sending verification email:',error);
        }

        
        const {accessToken,refreshToken}=generateTokens(user);

        res.cookie('refreshToken',refreshToken,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:'strict',
            maxAge:7*24*60*60*1000
        });

        res.status(201).json({
            success:true,
            message:'User registered. Please check your email for the verification code.', 
            accessToken,
            user:{
                id:user._id,
                email:user.email,
                name:`${user.name.first} ${user.name.last}`,
                role:user.role,
                isVerified:user.email_verification.verified
            } 
        })
    } 
    catch(error){
        console.error('Registration error:',error);
        res.status(500).json({
            success:false,
            message: error.message || 'Registration failed'
        });
    }
}

export const loginUser = async(req,res)=>{
    try{
        const errors=validationResult(req);
        if(!errors.isEmpty()){
            return res.status(400).json(
                {
                    errors:errors.array()
                }
            )
        }

        const {email,password}=req.body;
        const user=await User.findOne({email}).select('+password'); 
        if(!user){
            return res.status(401).json({
                success:false,
                message:'Invalid credentials'
            })
        }
        const isMatch=await user.matchPassword(password);
        if(!isMatch){
            return res.status(401).json({
                success:false,
                message:'Invalid credentials'
            })
        }
        const {accessToken,refreshToken}=generateTokens(user);

        res.cookie('refreshToken',refreshToken,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:'strict',
            maxAge:7*24*60*60*1000
        })

        res.json({
            success:true,
            accessToken,
            user:{
                id:user._id,
                email:user.email,
                name:`${user.name.first} ${user.name.last}`,
                role:user.role,
                isVerified:user.email_verification.verified
            }
        })
    } catch(error){
        console.error('Login error:',error);
        res.status(500).json({
            success:false,
            message:'Login failed',
            error:process.env.NODE_ENV==='development' ? error.message:undefined
        })
    }
}

export const logoutUser = async (req, res) => {
    try {
        
        res.cookie('refreshToken', '', {
            httpOnly: true,
            expires: new Date(0), 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        res.json({
            success: true,
            message: 'Logged out successfully'
        });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Logout failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

export const forgotPassword = async(req,res)=>{
    try{
        const user=await User.findOne({email:req.body.email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:'User not found'
            })
        }

        const resetToken=crypto.randomBytes(20).toString('hex'); 

        user.security.resetPasswordToken=crypto
            .createHash('sha256') 
            .update(resetToken) 
            .digest('hex'); 

        user.security.resetPasswordExpire=Date.now()+10*60*1000; 

        await user.save();

        const resetUrl=`${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

        const message=`You requested a password reset. Please go to: ${resetUrl}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password reset token',
                message,
            });
        } catch (emailError) {
            user.security.resetPasswordToken = undefined;
            user.security.resetPasswordExpire = undefined;
            await user.save();
            console.log('Email sending error:', emailError);
            throw new Error('Email sending failed');
        }
        

        res.json({
            success:true,
            message:'Email sent'
        });
    } catch(error){
        console.error('Forgot password error:',error)
        const user=await User.findOne({email:req.body.email});
        if(user){
            user.security.resetPasswordToken=undefined;
            user.security.resetPasswordExpire=undefined;
            await user.save();
        }

        return res.status(500).json({
            success:false,
            message:'Email could not be sent'
        })
    }
}


export const resetPassword=async(req,res)=>{
    try{
        const resetPassword=crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex')

        const user=await User.findOne({
            'security.resetPasswordToken':resetPassword,
            'security.resetPasswordExpire':{$gt:Date.now()}
        })

        if(!user){
            return res.status(400).json({
                success:false,
                message:'Invalid or expired reset token'
            })
        }

        user.password=req.body.password;
        user.security.resetPasswordToken=undefined;
        user.security.resetPasswordExpire=undefined;

        await user.save();

        const {accessToken,refreshToken}=generateTokens(user);

        res.cookie('refreshToken',refreshToken,{
            httpOnly:true,
            secure:process.env.NODE_ENV==='production',
            sameSite:'strict',
            maxAge:7*24*60*60*1000
        })

        res.json({
            success:true,
            message:'Password reset successful',
            accessToken
        })
    } catch(error){
        console.error('Reset password error: ',error);
        res.status(500).json({
            success:false,
            message:'Could not reset password',
            error:process.env.NODE_ENV==='development' ? error.message:undefined
        })
    }
}

export const sendVerificationEmail = async (user) => {
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('Generated verification code:', verificationCode);

    user.email_verification.token = crypto
        .createHash('sha256')
        .update(verificationCode)
        .digest('hex');
    user.email_verification.tokenExpires = Date.now() + 15 * 60 * 1000; 

    await user.save({ validateBeforeSave: false }); 

    const htmlMessage = `
        <div style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
            <h2 style="color: #4A5568;">Welcome to Ensemble!</h2>
            <p>Thank you for registering. Please use the following code to verify your email address:</p>
            <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #6B46C1; background-color: #F7FAFC; padding: 10px; border-radius: 5px; text-align: center;">
                ${verificationCode}
            </p>
            <p>This code will expire in 15 minutes.</p>
            <p>If you did not request this, please ignore this email.</p>
            <br/>
            <p>Best regards,<br/>The Ensemble Team</p>
        </div>
    `;

    await sendEmail({
        email: user.email,
        subject: 'Ensemble - Your Verification Code',
        html: htmlMessage, 
        message: `Your verification code is ${verificationCode}` 
    });
};

export const resendVerificationEmail = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Email is required.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({ success: false, message: 'User with this email not found.' });
        }

        if (user.email_verification.verified) {
            return res.status(400).json({ success: false, message: 'This email is already verified.' });
        }

        
        await sendVerificationEmail(user);

        res.status(200).json({ success: true, message: 'A new verification code has been sent to your email.' });

    } catch (error) {
        console.error('Error resending verification email:', error);
        res.status(500).json({ success: false, message: 'Failed to resend verification code.' });
    }
};

export const verifyEmail = async(req,res) => {
    try {
        const { email, code } = req.body;

        if (!email || !code) {
            return res.status(400).json({ success: false, message: 'Email and verification code are required.' });
        }

        
        const hashedToken = crypto
            .createHash('sha256')
            .update(code)
            .digest('hex');

        
        const user = await User.findOne({
            email: email.toLowerCase(),
            'email_verification.token': hashedToken,
            'email_verification.tokenExpires': { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired verification code.'
            });
        }

        
        user.email_verification.verified = true;
        user.email_verification.token = undefined;
        user.email_verification.tokenExpires = undefined;
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Email verified successfully. You can now log in.'
        });

    } catch(error) {
        console.error('Email verification error:', error);
        res.status(500).json({
            success: false,
            message: 'Email verification failed',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
