import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, signOut } from '@aws-amplify/auth'
import toast from "react-hot-toast";
import { uploadData } from "@aws-amplify/storage";



export default function Home(){
    const navigate = useNavigate()
    const uploadToS3 = async () => {
        try {
            const fileContent = JSON.stringify({ message: "Hello from user!" });

            await uploadData({
                key: "profile.json",
                data: fileContent,
                options: {
                    contentType: "application/json",
                    accessLevel: "private",
                }
            }).result;

            toast(`Uploaded successfully!`, {
                icon: '📤',
                style: {
                borderRadius: '10px',
                background: '#333',
                color: '#fff',
                },
            });
        } catch (error) {
                console.error('Upload failed:', error);
                toast.error('Upload failed');
            }
        };
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
            <Button onClick={uploadToS3}>Upload Test File</Button>
        </div>
    );
}