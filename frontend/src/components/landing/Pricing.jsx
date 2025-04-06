// frontend/src/components/landing/PricingSection.jsx (Example)
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PaymentButton from '@/components/payment/PaymentButton';
import { Check } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux'; // Import useDispatch
// import { updateUser } from '@/redux/slices/authSlice'; // Import action to update user state


// Fetch plan details from your config or define here
const plansData = [
    { id: 'FREE', name: 'Free', price: 0, currency: 'INR', features: ['1 Workspace', '2 Projects', 'Basic Chat'] },
    { id: 'BASIC', name: 'Basic', price: 500, currency: 'INR', features: ['5 Workspaces', 'Unlimited Projects', 'File Sharing', 'Basic Support'] },
    { id: 'PREMIUM', name: 'Premium', price: 1500, currency: 'INR', features: ['Unlimited Workspaces', 'Priority Support', 'AI Summaries', 'Advanced Reporting'] },
];


const Pricing = () => {
    const { isAuthenticated, user } = useSelector(state => state.auth);
    // const dispatch = useDispatch(); // Get dispatch function

    const handlePaymentSuccess = (paymentData) => {
        console.log("Payment success data from callback:", paymentData);
        const newPlan = paymentData?.updatedUser?.plan;
        if (newPlan) {
             // Option 1: Simple Alert (as before)
             alert(`Successfully upgraded to the ${newPlan} plan!`);

            // Option 2: Update Redux state (better UX)
            // Dispatch an action to update the user state in Redux
            // This assumes your authSlice has an 'updateUser' reducer
            // dispatch(updateUser({ preferences: { ...user.preferences, plan: newPlan } }));
            // toast.success(`Plan upgraded to ${newPlan}!`); // Use toast for better feedback
        }
        // Optionally refetch full user profile if needed:
        // dispatch(fetchUserProfile());
    };

    // Determine the user's current plan (assuming it's stored in user.preferences.plan)
    const currentPlanId = user?.preferences?.plan || 'FREE'; // Default to FREE if no plan found

    return (
        <section className="py-20 bg-gray-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">Choose Your Plan</h2>
                    <p className="text-lg text-gray-400">Simple, transparent pricing.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-stretch"> {/* Use items-stretch for equal height */}
                    {plansData.map((plan) => {
                        const isCurrentPlan = plan.id.toUpperCase() === currentPlanId.toUpperCase();

                        return (
                            <Card key={plan.id} className={`bg-gray-800/50 border-gray-700 flex flex-col ${isCurrentPlan ? 'border-purple-500 border-2' : ''}`}>
                                <CardHeader className="text-center">
                                    <CardTitle className={`text-2xl ${isCurrentPlan ? 'text-purple-400' : 'text-white'}`}>{plan.name}</CardTitle>
                                    <p className="text-4xl font-bold mt-4">
                                        ₹{plan.price}
                                        {plan.price > 0 && <span className="text-lg font-normal text-gray-400">/month</span>}
                                    </p>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start"> {/* Use items-start for long features */}
                                                <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0 mt-1" />
                                                <span className="text-gray-300">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    {isCurrentPlan ? (
                                        <Button className="w-full" variant="outline" disabled>Current Plan</Button>
                                    ) : plan.price === 0 ? (
                                         <Button className="w-full" variant="outline" disabled>Free Plan</Button> // Should not happen if currentPlanId logic is right
                                    ): (
                                        isAuthenticated ? (
                                            <PaymentButton
                                                amount={plan.price}     // For display on button
                                                planId={plan.id}        // ID to send to backend
                                                planName={plan.name}    // For display on button/checkout
                                                onPaymentSuccess={handlePaymentSuccess}
                                            />
                                        ) : (
                                            <Button className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:opacity-90" asChild>
                                                <a href="/login">Login to Choose Plan</a>
                                            </Button>
                                        )
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </section>
    );
};

export default Pricing;