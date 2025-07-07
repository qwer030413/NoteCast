import { ResetPasswordForm } from "@/components/ResetPasswordForm"
import { useState } from "react";
import { confirmResetPassword } from 'aws-amplify/auth';
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";



export default function ResetPassword() {
    const [password, setPassword] = useState("")
    const [password1, setPassword1] = useState("")
    const [code, setCode] = useState("")
    const location = useLocation();
    const email = location.state?.email;
    const navigate = useNavigate()
    const handleReset = () => {
        if (password === password1) {
            confirmResetPassword({
            username: email,
            confirmationCode: code,
            newPassword: password,
            })
            .then(() => {
                toast(`Password Resetted!`, {
                    icon: '✅',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });
                navigate('/Login')

            })
            .catch((error) => {
                console.log(error.name);
                if (error.name === "CodeMismatchException") {
                    toast(`The code you entered is incorrect.`, {
                        icon: '❌',
                        style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                        },
                    });
                } 
                else if (error.name === "ExpiredCodeException") {
                    toast(`The confirmation code has expired.`, {
                        icon: '⏰',
                        style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                        },
                    });
                } 
                else if (error.name === "LimitExceededException") {
                    toast(`Limit exceeded, try again later`, {
                        icon: '⏰',
                        style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                        },
                    });
                } 
                else {
                    toast(`An unexpected error occurred.`, {
                        icon: '❌',
                        style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                        },
                    });
                }
                
            });
        } 
        else {
            console.log("Passwords do not match!");
            // Handle mismatch error (e.g., toast)
        }
    };
    return(
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
        <div className="w-full max-w-sm">
            <ResetPasswordForm 
            password = {password} 
            password1 = {password1} 
            code = {code} 
            setPassword = {setPassword}
            setPassword1 = {setPassword1}
            setCode = {setCode}
            handleReset = {handleReset}
            />
        </div>
        </div>
    );
}   