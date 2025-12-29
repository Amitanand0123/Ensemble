import { razorpayInstance, isRazorpayConfigured } from '../config/razorpay.js';
import crypto from 'crypto';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import { getPlanById } from '../config/plans.js'; 

export const createOrder = async (req, res) => {
    
    if (!isRazorpayConfigured()) {
        console.warn("[Payment] Create Order attempt failed: Razorpay not configured.");
        return res.status(503).json({
            success: false,
            message: "Payment gateway is not configured on the server."
        });
    }

    const { planId } = req.body;
    const userId = req.user?._id; 

    if (!userId) {
         console.error("[Payment] Create Order failed: User ID not found in request. Authentication issue?");
         return res.status(401).json({ success: false, message: "User not authenticated." });
    }
     if (!planId) {
         console.warn("[Payment] Create Order failed: planId missing in request body.");
         return res.status(400).json({ success: false, message: "Plan ID is required." });
     }


    
    const selectedPlan = getPlanById(planId); 

    if (!selectedPlan) {
         console.warn(`[Payment] Create Order failed: Plan not found for ID: ${planId}`);
         return res.status(400).json({
             success: false,
             message: `Invalid plan ID selected: ${planId}`
         });
     }

    
    if (selectedPlan.amount == null || selectedPlan.amount <= 0) {
        console.warn(`[Payment] Create Order failed: Plan ${planId} has non-payable amount: ${selectedPlan.amount}`);
        return res.status(400).json({
            success: false,
            message: `Plan '${selectedPlan.name || planId}' is not a payable plan.`
        });
    }

    const { amount, currency, name: planName } = selectedPlan; 

    
    if (!currency || typeof currency !== 'string' || currency.length !== 3) {
         console.error(`[Payment] Create Order failed: Plan ${planId} has invalid currency: ${currency}`);
         return res.status(400).json({
            success:false,
            message: `Plan configuration error: Invalid currency '${currency}' for plan ${planId}.`
         });
    }

    const amountInSmallestUnit = Math.round(amount * 100); 
    const shortUserId = userId.toString().slice(-8);
    const shortTimestamp = Date.now().toString(36);

    const options = {
        amount: amountInSmallestUnit,
        currency: currency.toUpperCase(), 
        receipt: `${planId}_${shortUserId}_${shortTimestamp}`, 
        notes: {
            userId: userId.toString(),
            userEmail: req.user.email, 
            planId: planId, 
            planName: planName || 'N/A',
        }
    };

    try {
        
        const order = await razorpayInstance.orders.create(options);

        if (!order || !order.id) {
            console.error("[Payment] Razorpay order creation response missing ID or invalid:", order);
            return res.status(500).json({
                success: false,
                message: "Razorpay order creation failed (invalid response from gateway)."
            });
        }

        
        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount, 
            currency: order.currency,
            planId: planId, 
            keyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("[Payment] Error creating Razorpay order:", error); 
        const errorMessage = error?.error?.description || error?.message || "Could not create payment order.";
        const statusCode = error?.statusCode || 500; 
        console.error(`[Payment] Failed Order Creation - Status: ${statusCode}, Message: ${errorMessage}`);

        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};


export const verifyPayment = async (req, res) => {
    
    if (!isRazorpayConfigured()) {
         console.warn("[Payment] Verify Payment attempt failed: Razorpay not configured.");
        return res.status(503).json({
            success: false,
            message: "Payment gateway is not configured on the server."
        });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = req.body;
    const userId = req.user?._id;

     if (!userId) {
        console.error("[Payment] Verify Payment failed: User ID not found in request. Authentication issue?");
        return res.status(401).json({ success: false, message: "User not authenticated." });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !planId) {
        console.warn("[Payment] Verify Payment failed: Missing required payment details.", { body: req.body });
        return res.status(400).json({
            success: false,
            message: 'Missing required payment details for verification.'
        });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
        console.error("[Payment] CRITICAL: RAZORPAY_KEY_SECRET is not defined!");
        return res.status(500).json({
            success: false,
            message: 'Server payment configuration error.'
        });
    }

    

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    let isAuthentic = false;
    try {
        const expectedSignature = crypto 
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        isAuthentic = expectedSignature === razorpay_signature;
        
    } catch (error) {
        console.error("[Payment] Error generating HMAC signature:", error);
        return res.status(500).json({
            success: false,
            message: 'Error during payment verification process.'
        });
    }

    if (isAuthentic) {
        try {
            const existingPayment = await Payment.findOne({
                razorpay_payment_id: razorpay_payment_id
            });

            if (existingPayment) {
                console.warn(`[Payment] Payment ID ${razorpay_payment_id} has already been verified and recorded. Status: ${existingPayment.status}`);
                return res.status(200).json({ 
                    success: true,
                    message: "Payment already verified.",
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id,
                    status: 'already_verified' 
                });
            }

            let orderDetails;
            let paymentAmount = 0; 
            let paymentCurrency = 'INR'; 
            try {
                orderDetails = await razorpayInstance.orders.fetch(razorpay_order_id);
                if (orderDetails) {
                    paymentAmount = orderDetails.amount; 
                    paymentCurrency = orderDetails.currency;
                } else {
                     console.warn(`[Payment] Could not fetch details for Razorpay order ${razorpay_order_id}. Proceeding without order data.`);
                }
            } catch (fetchError) {
                console.error(`[Payment] Could not fetch Razorpay order ${razorpay_order_id} details:`, fetchError.message || fetchError);
            }

             const user = await User.findById(userId);
             if (!user) {
                 console.error(`[Payment] CRITICAL: User ${userId} not found during payment verification for payment ${razorpay_payment_id}. Payment cannot be assigned!`);
                 return res.status(404).json({ 
                     success: false,
                     message: "User associated with payment not found. Please contact support."
                 });
             }

            const paymentRecord = new Payment({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                user: userId,
                amount: paymentAmount, 
                currency: paymentCurrency, 
                status: 'verified', 
                plan: planId, 
                receipt: orderDetails?.receipt, 
                notes: orderDetails?.notes 
            });
            
            await paymentRecord.save();

            const validPlan = getPlanById(planId);
            if (validPlan) {
                user.preferences = user.preferences || {}; 
                user.preferences.plan = validPlan.id; 
                await user.save({ validateBeforeSave: false }); 
                 res.status(200).json({
                    success: true,
                    message: "Payment verified successfully and user updated.",
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id,
                    updatedUser: {
                        plan: user.preferences.plan
                    }
                });

            } else {
                 console.error(`[Payment] User ${userId} paid for plan ${planId}, but this plan is not currently valid/found in config. User plan NOT updated.`);
                 res.status(200).json({
                    success: true,
                    message: "Payment verified successfully, but user plan could not be updated (invalid plan ID).",
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id,
                    warning: "User plan not updated due to invalid plan ID.",
                    updatedUser: {
                         plan: user.preferences?.plan
                     }
                });
            }

        } catch (error) {
            console.error("[Payment] Error saving payment record or updating user:", error);
            res.status(500).json({
                success: false,
                message: "Payment verified, but a server error occurred while updating records. Please contact support."
            });
        }

    } else {
        console.warn(`[Payment] Signature verification failed for Order ID: ${razorpay_order_id}`);
        res.status(400).json({
            success: false,
            message: "Payment verification failed. Invalid signature."
        });
    }
};