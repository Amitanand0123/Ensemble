import mongoose from 'mongoose';

const paymentSchema=new mongoose.Schema({
    razorpay_order_id:{
        type:String,
        required:[true,'Razorpay order id is required'],
        index:true,
    },
    razorpay_payment_id:{
        type:String,
        required:[true,'Razorpay Payment ID is required.'],
        unique:true,
        index:true,
    },
    razorpay_signature:{
        type:String,
        required:[true,'Razorpay Signature is required.'],
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:[true,'User associated with payment is required.'],
        index:true,
    },
    amount:{
        type:Number,
        required:[true,'Payment amount is required.'],
    },
    currency:{
        type:String,
        required:[true,'Currency code is required.'],
        uppercase:true,
        default:'INR',
    },
    status:{
        type:String,
        enum:['created','authorized','captured','refunded','failed','verified'],
        required:true,
        default:'created',
        index:true
    },
    plan:{
        type:String,
        trim:true,
        index:true,
    },
    method:{
        type:String,
    },
    receipt:{
        type:String,
    },
    notes:{
        type:Map,
        of:mongoose.Schema.Types.Mixed
    },
    error_details:{
        code:String, // A short identifier for the error (e.g., "BAD_REQUEST_ERROR").
        description:String,
        source:String, // Which system component caused the error (e.g., "gateway" or "merchant").
        step:String, // The step in the payment lifecycle where the error occurred (e.g., "payment_authorization").
        reason:String, // A more specific reason for the failure (e.g., "card_declined").
        metadata:mongoose.Schema.Types.Mixed // Any additional data Razorpay or your app might attach (e.g., transaction IDs).
    }
},{
    timestamps:true,
})

export default mongoose.model('Payment',paymentSchema)