import Razorpay from 'razorpay'
import dotenv from 'dotenv'

dotenv.config()

const keyId=process.env.RAZORPAY_KEY_ID
const keySecret=process.env.RAZORPAY_KEY_SECRET

if(!keyId || !keySecret){
    console.warn("WARNING: Razorpay API Keys not found in .env file.");
    console.warn("Payment features requiring Razorpay will be disabled or use potentially invalid dummy keys.");
    console.warn("Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your backend .env file.");
}

export const razorpayInstance=(keyId && keySecret) ? new Razorpay({
    key_id:keyId,
    key_secret:keySecret,

}) : {
    orders: { 
        create: () => Promise.reject(new Error("Razorpay not configured")), 
        fetch: () => Promise.reject(new Error("Razorpay not configured")) 
    },
}

export const isRazorpayConfigured=()=> !!(keyId && keySecret); // A function that returns true if both keys are defined.