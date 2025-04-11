import User from '../models/User.js'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import crypto from 'crypto'
import sendEmail from '../utils/sendEmail.js'
import { validationResult } from 'express-validator'

dotenv.config() 

const JWT_SECRET=process.env.JWT_SECRET;
const JWT_REFRESH_SECRET=process.env.JWT_REFRESH_SECRET;

// export const loginLimiter = rateLimit({
//     windows:15*60*1000,
//     max:5,
//     message:'Too many login attempts, please try again after 15 minutes'
// })
const generateTokens = (user) =>{
    const accessToken=jwt.sign(  // jwt.sign(payload, secret, options)
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
            email:{$regex:new RegExp(`^${email}$`,'i')} //'i' makes it case insensitive
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

        res.cookie('refreshToken',refreshToken,{ //res.cookie(name, value, options)
            httpOnly:true, // Prevents client-side JavaScript from accessing the cookie.
            secure:process.env.NODE_ENV==='production', //Ensures the cookie is only sent over HTTPS in production
            sameSite:'strict',  // Limits the cookie's scope to the same domain, preventing cross-site requests.
            maxAge:7*24*60*60*1000 // in milliseconds
        });

        res.status(201).json({
            success:true,
            message:'User registered successfully',
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
        const user=await User.findOne({email}).select('+password'); // select('+password') to include password which overrides the default false selection in query
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
        // Clear the refresh token cookie
        res.cookie('refreshToken', '', {
            httpOnly: true,
            expires: new Date(0), // Expire immediately
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

        const resetToken=crypto.randomBytes(20).toString('hex'); // 20 bytes of random data in hex format -> 40 characters as each byte is represented by 2 characters :ff,00

        user.security.resetPasswordToken=crypto
            .createHash('sha256') // produces a 256 bit hash : 64 characters in hex
            .update(resetToken) // generated resetToken is hashed
            .digest('hex'); // convert to hex format 

        user.security.resetPasswordExpire=Date.now()+10*60*1000; // for 10 minutes

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
            throw new Error('Email sending failed');
        }
        

        res.json({
            success:true,
            message:'Email sent'
        });
    } catch(error){
        console.error('Forgot password error:',error)
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

export const sendVerificationEmail = async(user) => {
    const verificationToken =crypto.randomBytes(32).toString('hex');

    user.email_verification.token=crypto
        .createHash('sha256')
        .update(verificationToken)
        .digest('hex')
        
    user.email_verification.tokenExpires=Date.now()+24*60*60*1000;

    await user.save();

    const verificationUrl=`${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;
    console.log('Verification URL:',verificationUrl);
    await sendEmail({
        email:user.email,
        subject:'Email Verification-CollabStack',
        message:`Please verify your email by clicking on the following link: ${verificationUrl}\nLink expires in 24 hours.`
    });
}

export const verifyEmail=async(req,res)=>{
    try{
        const hashedToken=crypto
            .createHash('sha256')
            .update(req.params.token)
            .digest('hex')

        const user=await User.findOne({
            'email_verification.token':hashedToken,
            'email_verification.tokenExpires':{$gt:Date.now()}
        })

        if(!user){
            return res.status(400).json({
                success:false,
                message:'Invalid or expired verification token'
            })
        }

        user.email_verification.verified=true;
        user.email_verification.token=undefined;
        user.email_verification.tokenExpires=undefined;

        await user.save();

        res.status(200).json({
            success:true,
            message:'Email verified successfully'
        })

    } catch(error){
        console.error('Email verification error:',error);
        res.status(500).json({
            success:false,
            message:'Email verification failed',
            error:process.env.NODE_ENV==='development' ? error.message:undefined
        })
    }
}
