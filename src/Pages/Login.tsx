import { LoginForm } from "@/components/login-form"
import { useNavigate } from "react-router-dom"
import { signIn, signInWithRedirect, signOut} from '@aws-amplify/auth'
import toast from "react-hot-toast";

import { useState } from "react"
export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate()
  const signInWithGoogle = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    await signOut();
    await signInWithRedirect({ provider: 'Google', customState: 'select_account'});
  }

  const Login = async () => {
    try {
      await signIn({ username: email, password });
      navigate("/")
    } catch (err) {
      console.log(err)
      toast(`Wrong Email/Password OR account not vertifed`,
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
  }
  return (
    <div className="flex flex-col items-center justify-center p-6 md:p-10 h-screen">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm signInWithGoogle = {signInWithGoogle} onSubmit = {Login} setEmail={setEmail} setPassword = {setPassword} email = {email} password = {password} />
      </div>
    </div>
  )
}
