import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import User from '../models/User.js'
import dotenv from 'dotenv'

dotenv.config()
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret:process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:`${process.env.BACKEND_URL}/api/auth/google/callback`, //Redirect URL Google uses after successful login.
    scope:['profile','email'] //Data your app wants access to (email, profile).
},
    async(acessToken,refreshToken,profile,done)=>{ // This is the verify callback, triggered after Google authenticates the user.
        try {
            let user=await User.findOne({googleId:profile.id})
            if(user){
                return done(null,user);
            }
            const userEmail=profile.emails[0].value; // the user hasn't logged in with Google before, but an account with the same email already exists 
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
                    token:undefined, // Since the email is already verified via Google, you don’t need a token or expiry time
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

passport.serializeUser((user,done)=>{ // When a user logs in, Passport needs to store something in the session to identify them on future requests.
    done(null,user.id);
})

passport.deserializeUser(async(id,done)=>{ //  reconstruct the full user object from the session on each request.
    try {
        const user=await User.findById(id);
        done(null,user);
    } catch (error) {
        done(error,null);
    }
});