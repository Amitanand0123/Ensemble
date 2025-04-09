// frontend/src/components/payment/PaymentButton.jsx
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

const PaymentButton = ({ amount, planId, planName = 'Selected Plan', onPaymentSuccess }) => {
    const { user, token } = useSelector(state => state.auth);
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = async () => {
        if (!RAZORPAY_KEY_ID) {
            toast.error("Payment gateway key is not configured (Frontend).");
            console.error("VITE_RAZORPAY_KEY_ID is missing in frontend .env");
            return;
        }
        if (!token) {
            toast.error("Please log in to proceed with payment.");
            return;
        }
         if (!planId) {
            toast.error("Plan ID is missing.");
            console.error("PaymentButton requires a planId prop.");
            return;
         }

        setIsLoading(true);
        let loadingToastId = toast.loading('Initiating payment...');

        try {
            // 1. Create Order on Backend
            console.log(`[PaymentButton] Requesting order creation for planId: ${planId}`);
            const orderResponse = await axios.post(
                '/api/payments/create-order',
                { planId: planId }, // Send only planId
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { orderId, amount: orderAmount, currency, keyId } = orderResponse.data;

            if (!orderId || !orderAmount || !currency || !keyId) {
                console.error("[PaymentButton] Invalid order response from server:", orderResponse.data);
                throw new Error("Failed to get complete order details from server.");
            }

            console.log(`[PaymentButton] Order received: ${orderId}, Amount: ${orderAmount} ${currency}`);
            toast.dismiss(loadingToastId); // Dismiss initial toast
            loadingToastId = null; // Reset toast ID


            // 2. Configure Razorpay Options
            const options = {
                key: keyId,
                amount: orderAmount, // Amount in smallest unit from backend response
                currency: currency,
                name: "Ensemble App",
                description: `Payment for ${planName}`,
                // image: "/ensemble-logo-1.svg", // Your logo URL
                order_id: orderId,
                handler: async function (response) {
                    console.log("[PaymentButton] Razorpay Success Response:", response);
                    loadingToastId = toast.loading('Verifying payment...');

                    // 3. Verify Payment on Backend
                    try {
                        console.log(`[PaymentButton] Sending verification request for order: ${response.razorpay_order_id}`);
                        const verifyResponse = await axios.post(
                            '/api/payments/verify-payment',
                            {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                planId: planId // Pass planId for context during verification
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

                        console.log("[PaymentButton] Verification Response:", verifyResponse.data);
                        toast.dismiss(loadingToastId);

                        if (verifyResponse.data.success) {
                            toast.success("Payment Successful!");
                            if (onPaymentSuccess) {
                                onPaymentSuccess(verifyResponse.data);
                            }
                        } else {
                            throw new Error(verifyResponse.data.message || "Payment verification failed on server.");
                        }
                    } catch (verifyError) {
                        console.error("[PaymentButton] Payment Verification Error:", verifyError);
                        toast.dismiss(loadingToastId);
                        toast.error(verifyError.response?.data?.message || verifyError.message || "Payment verification failed.");
                        setIsLoading(false); // Ensure loading stops on verification error
                    } finally{
                        setIsLoading(false)
                    }

                },
                prefill: {
                    name: user?.name || "",
                    email: user?.email || "",
                },
                notes: {
                    // address: "Optional User Address"
                },
                theme: {
                    color: "#6366F1" // Example theme color (Indigo)
                },
                 // Enhance modal closing behavior
                 modal: {
                    ondismiss: function() {
                        console.log('[PaymentButton] Checkout form closed by user.');
                        if (loadingToastId) toast.dismiss(loadingToastId); // Dismiss loading toast if modal is closed
                        setIsLoading(false); // Re-enable button if modal is closed without payment attempt
                        // Optionally show a message like "Payment cancelled"
                        // toast.error("Payment cancelled.");
                     }
                 }
            };

            // 4. Open Razorpay Checkout Modal
             console.log("[PaymentButton] Opening Razorpay checkout...");
            const paymentObject = new window.Razorpay(options);

            paymentObject.on('payment.failed', function (response) {
                console.error("[PaymentButton] Razorpay Payment Failed:", response);
                if (loadingToastId) toast.dismiss(loadingToastId);
                toast.error(`Payment Failed: ${response.error.description || response.error.reason || 'Unknown Error'}`);
                console.error("Error Code:", response.error.code);
                console.error("Error Source:", response.error.source);
                console.error("Error Step:", response.error.step);
                console.error("Error Metadata:", response.error.metadata);
                setIsLoading(false); // Re-enable button on failure
            });

            paymentObject.open();
            // Don't set isLoading false here - handler/onfail/ondismiss will handle it

        } catch (error) {
            console.error("[PaymentButton] Error during payment initiation:", error);
            if (loadingToastId) toast.dismiss(loadingToastId);
            toast.error(error.response?.data?.message || error.message || "Could not initiate payment.");
            setIsLoading(false); // Re-enable button if order creation fails
        }
    };

    // Conditionally render the button or a message if the plan price is 0
     if (amount <= 0) {
        return <Button className="w-full" variant="outline" disabled>Free Plan</Button>;
     }


    return (
        <Button onClick={handlePayment} disabled={isLoading} className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90">
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
            ) : (
                // Display the actual amount passed as prop (primarily for display)
                `Pay ₹${amount} for ${planName}`
            )}
        </Button>
    );
};

export default PaymentButton;