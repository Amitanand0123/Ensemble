// paymentController.js
import { razorpayInstance, isRazorpayConfigured } from '../config/razorpay.js';
import crypto from 'crypto';
import User from '../models/User.js';
import Payment from '../models/Payment.js';
import { getPlanById } from '../config/plans.js'; // Assuming this path is correct

export const createOrder = async (req, res) => {
    console.log("[Payment] Received create-order request. Body:", req.body); // Log incoming request body
    if (!isRazorpayConfigured()) {
        console.warn("[Payment] Create Order attempt failed: Razorpay not configured.");
        return res.status(503).json({
            success: false,
            message: "Payment gateway is not configured on the server."
        });
    }

    const { planId } = req.body;
    const userId = req.user?._id; // Use optional chaining just in case

    if (!userId) {
         console.error("[Payment] Create Order failed: User ID not found in request. Authentication issue?");
         return res.status(401).json({ success: false, message: "User not authenticated." });
    }
     if (!planId) {
         console.warn("[Payment] Create Order failed: planId missing in request body.");
         return res.status(400).json({ success: false, message: "Plan ID is required." });
     }


    console.log(`[Payment] Looking for plan with ID: ${planId}`);
    const selectedPlan = getPlanById(planId); // Make sure getPlanById handles case sensitivity if needed

    if (!selectedPlan) {
         console.warn(`[Payment] Create Order failed: Plan not found for ID: ${planId}`);
         return res.status(400).json({
             success: false,
             message: `Invalid plan ID selected: ${planId}`
         });
     }

    // Specifically check if amount is payable AFTER confirming plan exists
    if (selectedPlan.amount == null || selectedPlan.amount <= 0) {
        console.warn(`[Payment] Create Order failed: Plan ${planId} has non-payable amount: ${selectedPlan.amount}`);
        return res.status(400).json({
            success: false,
            message: `Plan '${selectedPlan.name || planId}' is not a payable plan.`
        });
    }

    // *** FIX THE TYPO HERE ***
    // const {amount, curency, name:planName}=selectedPlan // OLD - Typo
    const { amount, currency, name: planName } = selectedPlan; // NEW - Corrected spelling

    // Ensure currency is valid (simple check for common case)
    if (!currency || typeof currency !== 'string' || currency.length !== 3) {
         console.error(`[Payment] Create Order failed: Plan ${planId} has invalid currency: ${currency}`);
         return res.status(400).json({
            success:false,
            message: `Plan configuration error: Invalid currency '${currency}' for plan ${planId}.`
         });
    }

    const amountInSmallestUnit = Math.round(amount * 100); // e.g., 500 INR becomes 50000 paise
    const shortUserId = userId.toString().slice(-8);
    const shortTimestamp = Date.now().toString(36);

    const options = {
        amount: amountInSmallestUnit,
        currency: currency.toUpperCase(), // Ensure currency is uppercase for Razorpay
        receipt: `${planId}_${shortUserId}_${shortTimestamp}`, // Made receipt slightly more unique
        notes: {
            userId: userId.toString(),
            userEmail: req.user.email, // Assuming email is available on req.user
            planId: planId, // Keep original planId case if needed, or use selectedPlan.id
            planName: planName || 'N/A',
        }
    };

    try {
        console.log(`[Payment] Attempting to create Razorpay order for User: ${req.user.email}, Plan: ${planId}, Options:`, JSON.stringify(options));
        const order = await razorpayInstance.orders.create(options);

        if (!order || !order.id) {
            console.error("[Payment] Razorpay order creation response missing ID or invalid:", order);
            return res.status(500).json({
                success: false,
                message: "Razorpay order creation failed (invalid response from gateway)."
            });
        }

        console.log(`[Payment] Razorpay order created successfully: ${order.id}`);
        res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount, // Send back the amount in smallest unit as returned by Rzp
            currency: order.currency,
            planId: planId, // Send back the planId used
            // IMPORTANT: Send the CORRECT key ID (frontend might have it but good practice)
            keyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error("[Payment] Error creating Razorpay order:", error); // Log the full error
        // Try to extract a more specific message from Razorpay's error structure
        const errorMessage = error?.error?.description || error?.message || "Could not create payment order.";
        const statusCode = error?.statusCode || 500; // Use Razorpay's status code if available
        console.error(`[Payment] Failed Order Creation - Status: ${statusCode}, Message: ${errorMessage}`);

        res.status(statusCode).json({
            success: false,
            message: errorMessage
        });
    }
};


export const verifyPayment = async (req, res) => {
    console.log("[Payment] Received verify-payment request. Body:", req.body);
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

    console.log(`[Payment] Verifying payment for Order ID: ${razorpay_order_id}, Payment ID: ${razorpay_payment_id}`);

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    let isAuthentic = false;
    try {
        const expectedSignature = crypto
            .createHmac('sha256', secret)
            .update(body.toString())
            .digest('hex');

        isAuthentic = expectedSignature === razorpay_signature;
        console.log(`[Payment] Signature verification result: ${isAuthentic ? 'Success' : 'Failed'}`);
    } catch (error) {
        console.error("[Payment] Error generating HMAC signature:", error);
        return res.status(500).json({
            success: false,
            message: 'Error during payment verification process.'
        });
    }

    if (isAuthentic) {
        try {
            // --- Check for existing payment FIRST ---
            const existingPayment = await Payment.findOne({
                razorpay_payment_id: razorpay_payment_id
            });

            if (existingPayment) {
                console.warn(`[Payment] Payment ID ${razorpay_payment_id} has already been verified and recorded. Status: ${existingPayment.status}`);
                 // Return success, but indicate it was already processed
                // *** FIX TYPO sjon -> json ***
                return res.status(200).json({ // Corrected typo here
                    success: true,
                    message: "Payment already verified.",
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id,
                    status: 'already_verified' // Add a status for frontend if needed
                });
            }

            // --- Fetch Order Details (Optional but good for validation/data enrichment) ---
            let orderDetails;
            let paymentAmount = 0; // Default value
            let paymentCurrency = 'INR'; // Default value
            try {
                orderDetails = await razorpayInstance.orders.fetch(razorpay_order_id);
                if (orderDetails) {
                    paymentAmount = orderDetails.amount; // Amount in smallest unit
                    paymentCurrency = orderDetails.currency;
                    console.log(`[Payment] Fetched order details. Amount: ${paymentAmount} ${paymentCurrency}, Receipt: ${orderDetails.receipt}`);

                    // Optional: Verify amount/currency against plan if needed
                    // const verifiedPlan = getPlanById(planId);
                    // if (!verifiedPlan || Math.round(verifiedPlan.amount * 100) !== paymentAmount || verifiedPlan.currency !== paymentCurrency) {
                    //     console.warn(`[Payment] Discrepancy found between fetched order (${paymentAmount} ${paymentCurrency}) and plan ${planId}!`);
                    //     // Decide how to handle discrepancy - maybe log and proceed, or fail verification
                    // }

                } else {
                     console.warn(`[Payment] Could not fetch details for Razorpay order ${razorpay_order_id}. Proceeding without order data.`);
                }
            } catch (fetchError) {
                console.error(`[Payment] Could not fetch Razorpay order ${razorpay_order_id} details:`, fetchError.message || fetchError);
                // Decide if this is critical. Usually, verification can proceed, but we log the error.
            }

            // --- Find User *before* saving payment & updating ---
             const user = await User.findById(userId);
             if (!user) {
                 // This is a critical issue - payment verified but cannot link to user
                 console.error(`[Payment] CRITICAL: User ${userId} not found during payment verification for payment ${razorpay_payment_id}. Payment cannot be assigned!`);
                 // Even though signature is valid, we can't complete the process.
                 return res.status(404).json({ // Return 404 here directly
                     success: false,
                     message: "User associated with payment not found. Please contact support."
                 });
             }

            // --- Save Payment Record ---
            const paymentRecord = new Payment({
                razorpay_order_id,
                razorpay_payment_id,
                razorpay_signature,
                user: userId,
                amount: paymentAmount, // Use amount from fetched order or default
                currency: paymentCurrency, // Use currency from fetched order or default
                status: 'verified', // Mark as verified since signature matched
                plan: planId, // Store the plan ID associated with this payment
                receipt: orderDetails?.receipt, // Optional: store receipt from order
                notes: orderDetails?.notes // Optional: store notes from order
                // Consider adding method if available from webhook or fetch
            });
            await paymentRecord.save();
            console.log(`[Payment] Payment record saved to DB: ${paymentRecord._id} for User: ${userId}`);

            // --- Update User Plan ---
            // Ensure the planId from the request is actually valid before updating
            const validPlan = getPlanById(planId);
            if (validPlan) {
                // Update user's plan preference
                user.preferences = user.preferences || {}; // Ensure preferences object exists
                user.preferences.plan = validPlan.id; // Use the canonical ID from your plans config
                await user.save({ validateBeforeSave: false }); // Save updated user, skip validation if only updating plan
                console.log(`[Payment] User ${userId} record updated with Plan: ${validPlan.id}`);

                 // --- Send Success Response ---
                 res.status(200).json({
                    success: true,
                    message: "Payment verified successfully and user updated.",
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id,
                    updatedUser: {
                        // Send back only necessary updated info
                        plan: user.preferences.plan
                    }
                });

            } else {
                 // Plan ID used in payment verification was invalid according to current config
                 console.error(`[Payment] User ${userId} paid for plan ${planId}, but this plan is not currently valid/found in config. User plan NOT updated.`);
                 // Send success for payment verification, but indicate user wasn't updated
                 res.status(200).json({
                    success: true,
                    message: "Payment verified successfully, but user plan could not be updated (invalid plan ID).",
                    orderId: razorpay_order_id,
                    paymentId: razorpay_payment_id,
                    warning: "User plan not updated due to invalid plan ID.",
                    updatedUser: { // Send current user plan
                         plan: user.preferences?.plan
                     }
                });
            }

        } catch (error) {
            console.error("[Payment] Error saving payment record or updating user:", error);
            // Payment signature was valid, but DB operation failed. This is serious.
            res.status(500).json({
                success: false,
                message: "Payment verified, but a server error occurred while updating records. Please contact support."
                // Include order/payment IDs to help trace
                // orderId: razorpay_order_id,
                // paymentId: razorpay_payment_id,
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