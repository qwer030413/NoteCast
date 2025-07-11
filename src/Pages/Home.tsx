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
        <div className="flex w-full h-full">
            <div className="flex-1 p-10 overflow-auto">
                <div className="flex justify-between items-center align-center">
                    <h1 className="text-lg">Recently Viewed</h1>
                    <Button variant="default" className="p-7 text-md w-60">
                        <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  stroke-width="2"  stroke-linecap="round"  stroke-linejoin="round"  class="icon icon-tabler icons-tabler-outline icon-tabler-upload"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 9l5 -5l5 5" /><path d="M12 4l0 12" /></svg>
                        Add New File
                    </Button>
                </div>

            </div>
            <div className="w-[300px] min-w-[250px] bg-muted p-4 rounded-lg shadow">
            chart
            </div>
        </div>
    );
}