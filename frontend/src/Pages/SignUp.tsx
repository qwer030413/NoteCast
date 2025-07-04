

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

export default function SignUp(){
    const [Email, setEmail] = useState("")
    const [Password, setPassword] = useState("")
    const [Username, setUsername] = useState("")
    const handleSignUp = () =>{
        console.log(Email, Password, Username)
        const attributeEmail = new CognitoUserAttribute({
            Name: "email",
            Value: Email,
        });
        const attributeList: CognitoUserAttribute[] = [attributeEmail];
        UserPool.signUp(Username,Password, attributeList, [], (err, data) => {
            if(err){
                console.log(err)
            }
            else{
                console.log(data)
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
                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Retype Password</Label>
                        </div>
                        <Input id="password2" type="password" required />
                    
                    </div>
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