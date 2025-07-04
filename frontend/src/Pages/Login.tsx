import { LoginForm } from "@/components/login-form"
import { CognitoUser, AuthenticationDetails } from "amazon-cognito-identity-js"
import UserPool from "@/aws/UserPool";
import { useNavigate } from "react-router-dom"
import { signInWithRedirect } from '@aws-amplify/auth'

import { useState } from "react"
export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const signInWithGoogle = async () => {
    try {
      await signInWithRedirect({provider:'Google'})
    } catch (error) {
      console.error('Google sign-in error:', error)
    }
  }
  const Login = () => {
    const user = new CognitoUser({
      Username: email,
      Pool: UserPool,
    })

    const authDetails = new AuthenticationDetails({
      Username:email,
      Password:password
    })

    user.authenticateUser(authDetails, {
      onSuccess: (data) => {
        console.log(data)
        navigate("/")
      },
      onFailure: (err) => {
        console.log(err)
      },

    })
  }
  return (
    <div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm signInWithGoogle = {signInWithGoogle} onSubmit = {Login} setEmail={setEmail} setPassword = {setPassword} email = {email} password = {password} />
      </div>
    </div>
  )
}
