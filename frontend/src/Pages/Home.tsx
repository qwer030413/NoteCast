import UserPool from "@/aws/UserPool";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from '@aws-amplify/auth'



export default function Home(){
    const navigate = useNavigate()

    const signOut = () => {
        const currentUser = UserPool.getCurrentUser();
        console.log("Current user before sign out:", currentUser);
        if (currentUser) {
            currentUser.signOut();
            navigate("/Login")
            console.log("User signed out successfully.");
        }
        // window.location.reload();
    }
    useEffect(() => {
  getCurrentUser()
    .then((user) => console.log("Logged in user:", user))
    .catch(() => console.log("Not signed in"))
}, [])
    return(
        <div className="HomePage">
            Home
            <Button onClick={() => signOut()}>Log Out</Button>
        </div>
    );
}