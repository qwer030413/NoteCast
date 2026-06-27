import { useState } from "react"
import { Link } from "react-router-dom"
import {
  AudioLines,
  BookOpenCheck,
  Eye,
  EyeOff,
  FileText,
  Headphones,
  Loader2,
  LockKeyhole,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface LoginFormProps extends React.ComponentProps<"div"> {
  email: string
  password: string
  isLoading: boolean
  setEmail: (email: string) => void
  setPassword: (password: string) => void
  onSubmit: () => void
  signInWithGoogle: () => void
}

export function LoginForm({
  className,
  email,
  password,
  isLoading,
  setEmail,
  setPassword,
  onSubmit,
  signInWithGoogle,
  ...props
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className={cn("w-full", className)} {...props}>
      <Card className="w-full overflow-hidden rounded-lg border-slate-200 p-0 shadow-xl shadow-slate-950/5 dark:border-slate-800">
        <CardContent className="grid min-h-[680px] p-0 lg:grid-cols-[1.08fr_0.92fr]">
          <section className="relative hidden overflow-hidden bg-slate-950 p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute inset-y-0 right-0 w-px bg-white/10" />
            <div>
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-lg bg-blue-600 shadow-lg shadow-blue-950/40">
                  <AudioLines className="size-6" />
                </div>
                <div>
                  <p className="text-lg font-bold">NoteCast</p>
                  <p className="text-xs text-slate-400">Notes that are easier to revisit</p>
                </div>
              </div>

              <div className="mt-16 max-w-lg">
                <p className="mb-4 text-xs font-bold uppercase text-cyan-400">Your study workspace</p>
                <h1 className="text-4xl font-bold leading-tight">Turn dense notes into something you can use.</h1>
                <p className="mt-5 max-w-md text-base leading-7 text-slate-300">
                  Keep documents, summaries, and audio reviews organized in one focused library.
                </p>
              </div>
            </div>

            <div className="relative space-y-3">
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex size-10 items-center justify-center rounded-md bg-blue-500/15 text-blue-300">
                  <FileText className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Lecture notes</p>
                  <p className="text-xs text-slate-400">12 pages indexed</p>
                </div>
                <span className="rounded-full bg-emerald-400/10 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-300">Ready</span>
              </div>
              <div className="grid grid-cols-[auto_1fr_auto] items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4">
                <div className="flex size-10 items-center justify-center rounded-md bg-cyan-500/15 text-cyan-300">
                  <Headphones className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Audio review</p>
                  <div className="mt-2 flex h-4 items-center gap-1" aria-hidden="true">
                    {[6, 12, 9, 16, 11, 7, 14, 10, 5, 13, 8, 4].map((height, index) => (
                      <span key={index} className="w-1 rounded-full bg-cyan-400/70" style={{ height }} />
                    ))}
                  </div>
                </div>
                <span className="text-xs font-medium text-slate-400">04:28</span>
              </div>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-3 rounded-lg border border-white/10 p-3 text-sm text-slate-300">
                  <Sparkles className="size-4 text-amber-300" />
                  AI summaries
                </div>
                <div className="flex items-center gap-3 rounded-lg border border-white/10 p-3 text-sm text-slate-300">
                  <BookOpenCheck className="size-4 text-emerald-300" />
                  Study guides
                </div>
              </div>
            </div>
          </section>

          <form
            className="flex items-center bg-white p-6 sm:p-10 lg:p-12 dark:bg-slate-900"
            onSubmit={(event) => {
              event.preventDefault()
              onSubmit()
            }}
          >
            <div className="mx-auto flex w-full max-w-sm flex-col gap-6">
              <div className="flex items-center gap-3 lg:hidden">
                <div className="flex size-10 items-center justify-center rounded-lg bg-blue-600 text-white">
                  <AudioLines className="size-5" />
                </div>
                <span className="text-lg font-bold">NoteCast</span>
              </div>

              <div>
                <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">Welcome back</p>
                <h2 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">Sign in to your account</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Continue to your notes, podcasts, and study tools.
                </p>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="email">Email or username</Label>
                <Input
                  id="email"
                  type="text"
                  autoComplete="username"
                  placeholder="you@example.com"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-11"
                />
              </div>

              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link to="/forgotpassword" className="ml-auto text-xs font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    className="h-11 px-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="h-11 w-full font-semibold" disabled={isLoading}>
                {isLoading ? <Loader2 className="size-4 animate-spin" /> : null}
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>

              <div className="after:border-border relative text-center after:absolute after:inset-0 after:top-1/2 after:z-0 after:border-t">
                <span className="relative z-10 bg-white px-3 text-xs text-muted-foreground dark:bg-slate-900">or</span>
              </div>

              <Button variant="outline" type="button" className="h-11 w-full gap-3 font-semibold" onClick={signInWithGoogle} disabled={isLoading}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="size-4" aria-hidden="true">
                  <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
                </svg>
                Continue with Google
              </Button>

              <div className="text-center text-sm text-slate-500 dark:text-slate-400">
                Don&apos;t have an account?{" "}
                <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">Create one</Link>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
