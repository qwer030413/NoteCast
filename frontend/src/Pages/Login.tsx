import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import './pages.css'



export default function Login() {
  return (
    <div className="LoginScreen">
    <h1 className="Header">Welcome to Note Cast</h1>
        <Card className="w-sm max-w-sm">
        <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
            Enter your email below to login to your account
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
                />
                </div>
                <div className="grid gap-2">
                <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                    <a
                    href="#"
                    className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                    >
                    Forgot your password?
                    </a>
                </div>
                <Input id="password" type="password" required />
                </div>
            </div>
            </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full">
            Login with Google
            </Button>
            <div className="flex items-center gap-2 w-full">
                <hr className="flex-grow border-t border-muted" />
                <span className="text-sm text-muted-foreground">or</span>
                <hr className="flex-grow border-t border-muted" />
            </div>
            <Button variant="outline" className="w-full">
            Sign Up
            </Button>
        </CardFooter>
        </Card>
    </div>
  );
}