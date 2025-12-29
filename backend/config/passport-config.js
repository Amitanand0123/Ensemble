import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.js'
import dotenv from 'dotenv'

dotenv.config()
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:`${process.env.BACKEND_URL}/api/auth/google/callback`,
    scope:['profile','email']
},
    async(acessToken,refreshToken,profile,done)=>{
        try {
            let user=await User.findOne({googleId:profile.id})
            if(user){
                return done(null,user);
            }
            const userEmail=profile.emails[0].value;
            if(!userEmail){
                return done(new Error('Could not retrieve email from Google profile.'),null)
            }
            user=await User.findOne({email:userEmail});
            if(user){
                user.googleId=profile.id;
                user.email_verification.verified=true;
                await user.save();
                return done(null,user);
            }
            const newUser=new User({
                googleId:profile.id,
                email:userEmail,
                name:{
                    first:profile.name?.givenName || 'User',
                    last:profile.name?.familyName || ''
                },
                avatar:{
                    url:profile.photos?.[0]?.value || 'default-avatar.png'
                },
                email_verification:{
                    verified:true,
                    token:undefined,
                    tokenExpires:undefined
                }
            })
            await newUser.save();
            return done(null,newUser);
        } catch (error) {
            console.error("Error in Google OAuth Strategy:",error);
            return done(error,null);
        }
    }
));

passport.serializeUser((user,done)=>{
    done(null,user.id);
})

passport.deserializeUser(async(id,done)=>{
    try {
        const user=await User.findById(id);
        done(null,user);
    } catch (error) {
        done(error,null);
    }
});