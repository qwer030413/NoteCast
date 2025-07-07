import { ForgotPasswordForm } from "@/components/ForgotPasswordForm"
import { resetPassword } from 'aws-amplify/auth';
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ForgotPassword() {
    const [email, setEmail] = useState("")
    const navigate = useNavigate()
    const handleReset = async () => {
        try {
            const output = await resetPassword({
            username: email,
            });

            const { nextStep } = output;

            switch (nextStep.resetPasswordStep) {
            case 'CONFIRM_RESET_PASSWORD_WITH_CODE':
                toast(`Confirmation code was sent to ${email}`, {
                    icon: '📨',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });
                navigate('/ResetPassword', { state: { email } })
                break;

            case 'DONE':
                toast('Password reset successfully.', {
                icon: '✅',
                style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                },
                });
                break;
            }
        } catch (error:any) {
            // Check for throttling or limit exceeded
            if (
            error.name === 'LimitExceededException' ||
            error.name === 'TooManyRequestsException'
            ) {
            toast('Too many requests. Please try again later.', {
                icon: '❌',
                style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
                },
            });
            } else {
            // Generic error handler
            toast(error.message || 'An error occurred. Please try again.', {
                icon: '⚠️',
                style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
                },
            });
            }

            console.error('Reset password error:', error);
        }
    };

    return(
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="w-full max-w-sm">
            <ForgotPasswordForm email = {email} setEmail = {setEmail} handleReset= {handleReset}/>
        </div>
        </div>
    );
}