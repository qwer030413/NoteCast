import { ResetPasswordForm } from "@/components/ResetPasswordForm"
import { useState } from "react";
import { confirmResetPassword } from 'aws-amplify/auth';
import { useLocation } from "react-router-dom";



export default function ResetPassword() {
    const [password, setPassword] = useState("")
    const [password1, setPassword1] = useState("")
    const [code, setCode] = useState("")
    const location = useLocation();
    const email = location.state?.email;
    const handleReset = async() => {
        if(password == password1){
            try{
                await confirmResetPassword({
                    username: email,
                    confirmationCode: code,
                    newPassword: password,
                });  
            } 
            catch(error:any){
                console.log(error)
            }
        }
        else{

        }
    }
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