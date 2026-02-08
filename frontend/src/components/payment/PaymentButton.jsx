import { useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';
import { Loader2 } from 'lucide-react';
import PropTypes from 'prop-types';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

const PaymentButton = ({ amount, planId, planName = 'Selected Plan', onPaymentSuccess }) => {
    const { user, token } = useSelector(state => state.auth);
    const [isLoading, setIsLoading] = useState(false);

    const handlePayment = async () => {
        if (!RAZORPAY_KEY_ID) {
            toast.error("Payment gateway is not configured on the client.");
            console.error("VITE_RAZORPAY_KEY_ID is missing in frontend .env");
            return;
        }
        if (!token || !user) { 
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
            
            const orderResponse = await axios.post(
                '/api/payments/create-order',
                { planId: planId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            const { orderId, amount: orderAmount, currency, keyId } = orderResponse.data;

            if (!orderId || !orderAmount || !currency || !keyId) {
                throw new Error("Failed to get complete order details from server.");
            }
            
            toast.dismiss(loadingToastId);
            loadingToastId = null;

            
            const options = {
                key: keyId,
                amount: orderAmount,
                currency: currency,
                name: "Ensemble App",
                description: `Payment for ${planName}`,
                order_id: orderId,
                handler: async function (response) {
                    loadingToastId = toast.loading('Verifying payment...');
                    
                    try {
                        const verifyResponse = await axios.post(
                            '/api/payments/verify-payment',
                            {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                planId: planId
                            },
                            { headers: { Authorization: `Bearer ${token}` } }
                        );

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
                        toast.dismiss(loadingToastId);
                        toast.error(verifyError.response?.data?.message || verifyError.message || "Payment verification failed.");
                    } finally {
                        setIsLoading(false);
                    }
                },
                prefill: {
                    name: `${user.name?.first || ''} ${user.name?.last || ''}`.trim(),
                    email: user.email || "",
                },
                theme: {
                    color: "#6366F1"
                },
                 modal: {
                    ondismiss: function() {
                        if (loadingToastId) toast.dismiss(loadingToastId);
                        setIsLoading(false);
                     }
                 }
            };

            
            const paymentObject = new window.Razorpay(options);
            paymentObject.on('payment.failed', function (response) {
                if (loadingToastId) toast.dismiss(loadingToastId);
                toast.error(`Payment Failed: ${response.error.description || 'Please try again.'}`);
                console.error("Razorpay Payment Failed:", response.error);
                setIsLoading(false);
            });
            paymentObject.open();
        } catch (error) {
            if (loadingToastId) toast.dismiss(loadingToastId);
            toast.error(error.response?.data?.message || error.message || "Could not initiate payment.");
            setIsLoading(false);
        }
    };

     if (amount <= 0) {
        return <Button className="w-full" variant="outline" disabled>Free Plan</Button>;
     }

    return (
        <Button onClick={handlePayment} disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            {isLoading ? (
                <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...
                </>
            ) : (
                `Pay ₹${amount} for ${planName}`
            )}
        </Button>
    );
};

PaymentButton.propTypes = {
    planId: PropTypes.string.isRequired,
    planName: PropTypes.string.isRequired,
    amount: PropTypes.number.isRequired,
    onPaymentSuccess: PropTypes.func,
};

export default PaymentButton;