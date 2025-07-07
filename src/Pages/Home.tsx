import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, signOut } from '@aws-amplify/auth'
import toast from "react-hot-toast";



export default function Home(){
    const navigate = useNavigate()

    const handleSignOut = async () => {
        await signOut();
        toast(`Signed out!`,
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
    useEffect(() => {
        getCurrentUser()
        .then((user) => {
            console.log("Logged in user:", user)
            toast(`Welcome ${user.username}!`,
                {
                    icon: '👋',
                    style: {
                    borderRadius: '10px',
                    background: '#333',
                    color: '#fff',
                    },
                }
            );
        })
        .catch(() => console.log("Not signed in"))
    }, [])
    return(
        <div className="HomePage">
            Home
            <Button onClick={() => handleSignOut()}>Log Out</Button>
        </div>
    );
}