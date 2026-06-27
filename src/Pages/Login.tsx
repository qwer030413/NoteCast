import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { signIn, signInWithRedirect, signOut } from "@aws-amplify/auth"
import { toast } from "sonner"
import { LoginForm } from "@/components/login/login-form1"
import { useAuth } from "@/aws/AuthProvider"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { refreshAuth } = useAuth()

  const signInWithGoogle = async () => {
    await signOut()
    await signInWithRedirect({ provider: "Google", customState: "select_account" })
  }

  const login = async () => {
    setIsLoading(true)
    try {
      await signIn({ username: email, password })
      await refreshAuth()
      navigate("/home")
    } catch (error) {
      console.error("Sign in failed", error)
      toast.error("Unable to sign in", {
        description: "Check your username, password, and account verification status.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 p-3 sm:p-6 lg:p-8 dark:bg-slate-950">
      <div className="mx-auto flex min-h-[calc(100vh-1.5rem)] max-w-6xl items-center sm:min-h-[calc(100vh-3rem)] lg:min-h-[calc(100vh-4rem)]">
        <LoginForm
          signInWithGoogle={signInWithGoogle}
          onSubmit={login}
          setEmail={setEmail}
          setPassword={setPassword}
          email={email}
          password={password}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
