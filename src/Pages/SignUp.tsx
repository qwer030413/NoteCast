

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Link } from "react-router-dom";
import './pages.css'
import { useState } from "react";
import UserPool from "@/aws/UserPool";
import { CognitoUserAttribute } from "amazon-cognito-identity-js";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react";

export default function SignUp(){
    const [Email, setEmail] = useState("")
    const [Password, setPassword] = useState("")
    const [Password2, setPassword2] = useState("")
    const [Username, setUsername] = useState("")
    const navigate = useNavigate()
    function isValidPassword(password: string): boolean {
        const minLength = /.{8,}/;
        const hasUpperCase = /[A-Z]/;
        const hasNumber = /\d/;
        const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/;

        return (
            minLength.test(password) &&
            hasUpperCase.test(password) &&
            hasNumber.test(password) &&
            hasSpecialChar.test(password)
        );
    }
    const handleSignUp = () =>{
        if(Password != Password2){
            toast(`Passwords has to match!!`,
                {
                    icon: '❌',
                    style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                    },
                }
            );
            return
        }
        const attributeEmail = new CognitoUserAttribute({
            Name: "email",
            Value: Email,
        });
        const attributeList: CognitoUserAttribute[] = [attributeEmail];
        UserPool.signUp(Username,Password, attributeList, [], (err, data) => {
            if(err){
                console.log(err)
                toast(`Oops, something went wrong`,
                    {
                        icon: '❌',
                        style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                        },
                    }
                );
            }
            else{
                console.log(data)
                toast(`Vertification Email sent to ${Email}`,
                    {
                        icon: '✅',
                        style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                        },
                    }
                );
                navigate('/Login')
            }
        })
    }
    return(
        <div className="SignUpPage">
            <Card className="w-sm max-w-sm h-sm">
            <CardHeader>
                <CardTitle>Thank you for joining Note Cast</CardTitle>
                <CardDescription>
                Creating New Account
                </CardDescription>
                {/* <CardAction>
                <Button variant="link"  className="text-white cursor-pointer">Sign Up</Button>
                </CardAction> */}
            </CardHeader>
            <CardContent>
                <form>
                <div className="flex flex-col gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="m@example.com"
                            required
                            value={Email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">Username</Label>
                        <Input
                            id="name"
                            type="text"
                            required
                            value={Username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                        </div>
                        <Input 
                        id="password" 
                        type="password" 
                        required 
                        value={Password}
                        onChange={(e) => setPassword(e.target.value)}
                        />
                        
                    </div>
                    {Password && !isValidPassword(Password) && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Invalid Password</AlertTitle>
                        <AlertDescription>
                        Password must:
                        <ul className="list-disc list-inside">
                            <li>Be at least 8 characters</li>
                            <li>Contain at least one uppercase letter</li>
                            <li>Include at least one number</li>
                            <li>Include at least one special character</li>
                        </ul>
                        </AlertDescription>
                    </Alert>
                    )}
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Retype Password</Label>
                        </div>
                        <Input
                        id="password2" 
                        type="password" 
                        required 
                        value={Password2}
                        onChange={(e) => setPassword2(e.target.value)}
                        />
                    
                    </div>
                    {Password2 && Password != Password2 && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Passwords Should Match</AlertTitle>
                    </Alert>
                    )}
                </div>
                </form>
            </CardContent>
            <CardFooter className="flex-col gap-2">
                
                <Button type="submit" className="w-full" onClick={() => handleSignUp()}>
                Sign Up
                </Button>
                <div className="mt-4 text-center text-sm">
                    Already have an account?{' '}
                    <Link to="/Login" className="underline">
                    Login
                    </Link>
                </div>
            </CardFooter>
            </Card>
        </div>
    );
}