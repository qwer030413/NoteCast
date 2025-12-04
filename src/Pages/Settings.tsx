import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { getCurrentUser, fetchUserAttributes } from '@aws-amplify/auth'
export default function Settings() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [notifications, setNotifications] = useState(true);
    const [theme, setTheme] = useState("light");
    const [profilePic, setProfilePic] = useState<string | null>("");
    const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setProfilePic(url);
    };

    useEffect(() => {
    getCurrentUser()
      .then(async (user) => {
        (user.username)

        setUsername(user.username)

        const attributes = await fetchUserAttributes()
        console.log("Attributes:", attributes)

        setEmail(attributes.email? attributes.email : "")
      })
      .catch(() => console.log("Not signed in"))
  }, [])

    return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 max-w-3xl mx-auto space-y-8"
    >
        <h1 className="text-3xl font-bold">Settings</h1>

        <Card className="rounded-2xl shadow-md">
        <CardHeader>
        <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
        <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
            <AvatarImage src={profilePic || undefined} />
            <AvatarFallback>SP</AvatarFallback>
            </Avatar>
            <div>
                <Label htmlFor="profilePic" className="cursor-pointer underline">
                Change Profile Picture
                </Label>
                <Input id="profilePic" type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange}/>
            </div>
        </div>

        <div className="space-y-2">
            <Label>Username</Label>
            <Input value={username} onChange={(e) => setUsername(e.target.value)}/>
        </div>
        <div className="space-y-2">
            <Label>Email</Label>
            <Input value={email} disabled className="opacity-70" />
        </div>


        <Button className="w-full mt-4">Save Changes</Button>
        </CardContent>
        </Card>

        <Separator />
            <Card className="rounded-2xl shadow-md">
                <CardHeader>
                <CardTitle>Notifications</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                    <Label className="text-base">Enable Notifications</Label>
                    <Switch checked={notifications} onCheckedChange={setNotifications} />
                </div>
                </CardContent>
            </Card>

        <Separator />
        <Card className="rounded-2xl shadow-md">
            <CardHeader>
            <CardTitle>Appearance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <div className="space-y-2">
                <Label>Theme</Label>
                <Select value={theme} onValueChange={setTheme}>
                <SelectTrigger>
                    <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                </SelectContent>
                </Select>
            </div>
            </CardContent>
        </Card>
    </motion.div>
  );
}
