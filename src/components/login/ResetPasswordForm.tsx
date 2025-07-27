import { GalleryVerticalEnd } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { REGEXP_ONLY_DIGITS } from "input-otp"
import { useNavigate } from "react-router-dom"
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react";
interface ResetPasswordProps extends React.ComponentProps<"div"> {
  password: string
  password1: string
  code: string
  setPassword: (password: string) => void
  setPassword1: (password1: string) => void
  setCode: (code: string) => void
  className?: string; 
  handleReset: () => void;
}
export function ResetPasswordForm({
  password,
  password1,
  code,
  setPassword,
  setPassword1,
  setCode,
  className,
  handleReset,
  ...props
}: ResetPasswordProps) {
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
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form 
        onSubmit={(e) => {
          e.preventDefault()
          handleReset()
        }}
      >
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <a
              href="#"
              className="flex flex-col items-center gap-2 font-medium"
            >
              <div className="flex size-8 items-center justify-center rounded-md">
                <GalleryVerticalEnd className="size-6" />
              </div>
              <span className="sr-only">Acme Inc.</span>
            </a>
            <h1 className="text-xl font-bold">Reset Password</h1>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">Vertification Code:</Label>
              <InputOTP maxLength={6} pattern={REGEXP_ONLY_DIGITS} value = {code} onChange={setCode}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">New Password:</Label>
              <Input
                  id="password"
                  type="password"
                  required
                  value = {password}
                  onChange={(e) => setPassword(e.target.value)}
                />
            </div>
            {password && !isValidPassword(password) && (
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
            <div className="grid gap-3">
              <Label htmlFor="password">Repeat New Password:</Label>
              <Input
                  id="password1"
                  type="password"
                  required
                  value = {password1}
                  onChange={(e) => setPassword1(e.target.value)}
                />
            </div>
            {password1 && password != password1 && (
              <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Passwords Should Match</AlertTitle>
              </Alert>
            )}
            <Button type="submit" className="w-full">
              Reset Password
            </Button>
          </div>
          <div className="after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t">
            <span className="bg-background text-muted-foreground relative z-10 px-2">
              Or
            </span>
          </div>
          <div className="grid gap-4">
            <Button type = "button" variant="outline" onClick={() => navigate('/Login')}>Return to Login</Button>
          </div>
        </div>
      </form>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        By clicking continue, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </div>
    </div>
  )
}
