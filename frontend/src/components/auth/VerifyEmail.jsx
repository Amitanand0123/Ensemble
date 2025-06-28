import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { verifyEmailWithCode, resendVerificationCode, clearError, clearMessage } from '../../redux/slices/authSlice';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, MailCheck } from 'lucide-react';
import { toast } from 'react-hot-toast';

const VerifyEmail = () => {
    const [code, setCode] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const { user, isLoading, error, message } = useSelector(state => state.auth);

    useEffect(() => {
        dispatch(clearError());
        dispatch(clearMessage());
    }, [dispatch]);

    useEffect(() => {
        if (!user?.email) {
            toast.error("No user session found. Please register or log in.");
            navigate('/register');
        }
    }, [user, navigate]);

    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
        }
        return () => clearTimeout(timer);
    }, [resendCooldown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!code.trim() || code.length !== 6) {
            toast.error("Please enter a valid 6-digit code.");
            return;
        }
        try {
            const result = await dispatch(verifyEmailWithCode({ email: user.email, code })).unwrap();
            toast.success(result.message || "Verification successful! Redirecting to login...");
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            toast.error(err || "Verification failed.");
        }
    };

    const handleResendCode = async () => {
        if (resendCooldown > 0) return;
        try {
            const result = await dispatch(resendVerificationCode(user.email)).unwrap();
            toast.success(result.message || "New code sent!");
            setResendCooldown(60); 
        } catch (err) {
            toast.error(err || "Failed to resend code.");
        }
    };

    return (
        <div className='min-h-screen flex items-center justify-center bg-gray-900 p-4'>
            <div className='max-w-md w-full space-y-8 bg-gray-800/50 backdrop-blur-xl rounded-2xl border border-gray-700 p-8 shadow-xl'>
                <div className='text-center'>
                    <MailCheck className="mx-auto h-12 w-12 text-purple-400" />
                    <h2 className='mt-6 text-center text-3xl font-bold tracking-tight text-white'>
                        Check your email
                    </h2>
                    <p className='mt-2 text-center text-sm text-gray-400'>
                        Weve sent a 6-digit verification code to <span className="font-medium text-purple-300">{user?.email}</span>.
                    </p>
                </div>

                {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
                {message && <Alert variant="success" className="bg-green-900/30 border-green-700 text-green-300"><AlertDescription>{message}</AlertDescription></Alert>}

                <form className='mt-8 space-y-6' onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="code" className="sr-only">Verification Code</label>
                        <Input
                            id="code"
                            name="code"
                            type="text"
                            maxLength="6"
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))} 
                            required
                            className="text-center text-2xl tracking-[1em] bg-gray-700 border-gray-600 h-14"
                            placeholder="______"
                        />
                    </div>

                    <div>
                        <Button
                            type="submit"
                            className='w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90'
                            disabled={isLoading}
                        >
                            {isLoading && !resendCooldown ? <Loader2 className="animate-spin" /> : "Verify Account"}
                        </Button>
                    </div>
                </form>
                <div className="text-center text-sm text-gray-400">
                    <p>Didnt receive the email? Check spam or
                        <button 
                            onClick={handleResendCode}
                            disabled={resendCooldown > 0 || isLoading}
                            className="font-medium text-purple-400 hover:text-purple-300 disabled:text-gray-500 disabled:cursor-not-allowed ml-1"
                        >
                            resend code {resendCooldown > 0 ? `(${resendCooldown}s)` : ''}
                        </button>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default VerifyEmail;