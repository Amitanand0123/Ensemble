import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PaymentButton from '@/components/payment/PaymentButton';
import { Check } from 'lucide-react';
import { useSelector } from 'react-redux'; 

const plansData = [
    { id: 'FREE', name: 'Free', price: 0, currency: 'INR', features: ['1 Workspace', '2 Projects', 'Basic Chat'] },
    { id: 'BASIC', name: 'Basic', price: 500, currency: 'INR', features: ['5 Workspaces', 'Unlimited Projects', 'File Sharing', 'Basic Support'] },
    { id: 'PREMIUM', name: 'Premium', price: 1500, currency: 'INR', features: ['Unlimited Workspaces', 'Priority Support', 'AI Summaries', 'Advanced Reporting'] },
];


const Pricing = () => {
    const { isAuthenticated, user } = useSelector(state => state.auth);
    

    const handlePaymentSuccess = (paymentData) => {
        
        const newPlan = paymentData?.updatedUser?.plan;
        if (newPlan) {
            alert(`Successfully upgraded to the ${newPlan} plan!`);
        }
    };
    const currentPlanId = user?.preferences?.plan || 'FREE'; 

    return (
        <section className="py-20 bg-background text-foreground relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className='absolute left-1/4 top-20 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse'/>
                <div className='absolute right-1/3 bottom-20 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse' style={{animationDelay: '1s'}}/>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                <div className="text-center mb-12">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4">
                        <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                            Choose Your Plan
                        </span>
                    </h2>
                    <p className="text-lg text-muted-foreground">Simple, transparent pricing.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 items-stretch">
                    {plansData.map((plan) => {
                        const isCurrentPlan = plan.id.toUpperCase() === currentPlanId.toUpperCase();

                        return (
                            <Card key={plan.id} className={`bg-card/80 backdrop-blur-md border-2 flex flex-col transition-all hover:shadow-xl ${isCurrentPlan ? 'border-accent shadow-accent/20' : 'border-border hover:border-accent/50'}`}>
                                <CardHeader className="text-center">
                                    <CardTitle className={`text-2xl ${isCurrentPlan ? 'text-accent' : 'text-foreground'}`}>{plan.name}</CardTitle>
                                    <p className="text-4xl font-bold mt-4 text-foreground">
                                        ₹{plan.price}
                                        {plan.price > 0 && <span className="text-lg font-normal text-muted-foreground">/month</span>}
                                    </p>
                                </CardHeader>
                                <CardContent className="flex-grow">
                                    <ul className="space-y-3">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-start">
                                                <Check className="h-5 w-5 text-secondary mr-2 flex-shrink-0 mt-1" />
                                                <span className="text-muted-foreground">{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    {isCurrentPlan ? (
                                        <Button className="w-full bg-accent/20 border-accent text-accent hover:bg-accent/30" variant="outline" disabled>Current Plan</Button>
                                    ) : plan.price === 0 ? (
                                         <Button className="w-full" variant="outline" disabled>Free Plan</Button>
                                    ): (
                                        isAuthenticated ? (
                                            <PaymentButton
                                                amount={plan.price}
                                                planId={plan.id}
                                                planName={plan.name}
                                                onPaymentSuccess={handlePaymentSuccess}
                                            />
                                        ) : (
                                            <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-primary/30 transition-all" asChild>
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