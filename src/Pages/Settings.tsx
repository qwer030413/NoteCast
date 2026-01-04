import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { getCurrentUser, fetchAuthSession, fetchUserAttributes } from '@aws-amplify/auth';
import { DynamoDBClient, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import type { AuthUser } from 'aws-amplify/auth';
import { Camera, Loader2, Mail, Moon, Sun, User, Bell, ShieldCheck, Palette, Save } from "lucide-react";

// Animation Variants
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: { type: "spring", stiffness: 120 }
    }
};

export default function Settings() {
    
    // State
    const [email, setEmail] = useState("");
    const [user, setUser] = useState<AuthUser | undefined>(undefined);
    const [notifications, setNotifications] = useState(true);
    const [theme, setTheme] = useState("light");
    const [profilePic, setProfilePic] = useState<string | null>("");
    const [isLoading, setIsLoading] = useState(false);
    
    // AWS Clients
    const [dynamoClient, setDynamoClient] = useState<DynamoDBClient | null>(null);

    useEffect(() => {
        const initData = async () => {
            try {
                const session = await fetchAuthSession();
                const credentials = session.credentials;
                if (!credentials) throw new Error("No credentials found");
    
                const client = new DynamoDBClient({
                    region: 'us-east-2',
                    credentials: {
                        accessKeyId: credentials.accessKeyId,
                        secretAccessKey: credentials.secretAccessKey,
                        sessionToken: credentials.sessionToken,
                    },
                });
                setDynamoClient(client);

                const currentUser = await getCurrentUser();
                setUser(currentUser);

                const attributes = await fetchUserAttributes();
                if (attributes.email) setEmail(attributes.email);
                
            } catch (err) {
                console.error("Initialization error:", err);
            }
        };
        initData();
    }, []);

    const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setProfilePic(url);
    };

    const handleSaveChanges = async () => {
        if (!user || !dynamoClient) return;
        setIsLoading(true);

        try {
            const command = new UpdateItemCommand({
                TableName: "Users", 
                Key: { userName: { S: user.username } },
                UpdateExpression: "SET profilePictureUrl = :profilePictureUrl",
                ExpressionAttributeValues: { ":profilePictureUrl": { S: profilePic || "" } }
            });

            await dynamoClient.send(command);
        } catch (err) {
            console.error("Error updating profile:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="bg-muted/40 p-4 md:p-10 w-full rounded-md"
        >
            <div className="mx-auto max-w-5xl space-y-8">
                
                {/* Page Header */}
                <motion.div variants={itemVariants} className="flex flex-col gap-2">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Settings</h1>
                    <p className="text-muted-foreground text-lg">
                        Manage your account settings and set e-mail preferences.
                    </p>
                </motion.div>

                <div className="grid gap-8 lg:grid-cols-3">
                    
                    {/* LEFT COLUMN: Profile (Span 2) */}
                    <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                        <Card className="border-none shadow-md overflow-hidden">
                            <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-90"></div>
                            
                            <CardContent className="relative pt-0">
                                {/* Floating Avatar */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-12 mb-6 gap-6">
                                    <div className="relative group">
                                        <Avatar className="w-32 h-32 border-4 border-background shadow-xl rounded-full">
                                            <AvatarImage src={profilePic || undefined} className="object-cover" />
                                            <AvatarFallback className="text-2xl font-bold bg-muted text-muted-foreground">
                                                {user?.username.slice(0, 2).toUpperCase() || "ME"}
                                            </AvatarFallback>
                                        </Avatar>
                                        
                                        {/* Camera Overlay */}
                                        <label 
                                            htmlFor="profilePic" 
                                            className="absolute inset-0 flex items-center justify-center bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-all duration-200 rounded-full cursor-pointer backdrop-blur-sm"
                                        >
                                            <Camera className="w-8 h-8" />
                                        </label>
                                        <Input 
                                            id="profilePic" 
                                            type="file" 
                                            accept="image/*" 
                                            className="hidden" 
                                            onChange={handleProfilePicChange}
                                        />
                                    </div>
                                    
                                    <div className="space-y-1 pb-2">
                                        <h2 className="text-2xl font-semibold">{user?.username || "Guest User"}</h2>
                                        <p className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
                                            <ShieldCheck className="w-4 h-4 text-emerald-500" /> 
                                            Account Active
                                        </p>
                                    </div>
                                    
                                    <div className="sm:ml-auto pb-2">
                                        <Button onClick={handleSaveChanges} disabled={isLoading} size="sm" className="gap-2">
                                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                            {isLoading ? "Saving..." : "Save Changes"}
                                        </Button>
                                    </div>
                                </div>

                                <Separator className="mb-6" />

                                {/* Form Fields */}
                                <div className="grid gap-6">
                                    <div className="grid gap-3">
                                        <Label htmlFor="username" className="text-muted-foreground font-medium">Username</Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="username" 
                                                value={user?.username || "Loading..."} 
                                                disabled 
                                                className="pl-9 bg-muted/20 border-muted-foreground/20 text-foreground font-medium" 
                                            />
                                        </div>
                                    </div>
                                    <div className="grid gap-3">
                                        <Label htmlFor="email" className="text-muted-foreground font-medium">Email Address</Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                            <Input 
                                                id="email" 
                                                value={email} 
                                                disabled 
                                                placeholder="Fetching email..."
                                                className="pl-9 bg-muted/20 border-muted-foreground/20 text-foreground font-medium" 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* RIGHT COLUMN: Preferences (Span 1) */}
                    <div className="space-y-6">
                        
                        {/* Appearance */}
                        <motion.div variants={itemVariants}>
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                            <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                        </div>
                                        Appearance
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Theme</Label>
                                            <Select value={theme} onValueChange={setTheme}>
                                                <SelectTrigger className="w-full">
                                                    <div className="flex items-center gap-2">
                                                        {theme === 'light' ? <Sun className="w-4 h-4 text-orange-500"/> : <Moon className="w-4 h-4 text-blue-400"/>}
                                                        <SelectValue placeholder="Select theme" />
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="light">Light</SelectItem>
                                                    <SelectItem value="dark">Dark</SelectItem>
                                                    <SelectItem value="system">System</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Notifications */}
                        <motion.div variants={itemVariants}>
                            <Card className="shadow-sm">
                                <CardHeader className="pb-3">
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                            <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        Notifications
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-start justify-between space-x-4">
                                        <div className="space-y-1">
                                            <p className="font-medium leading-none">Push Alerts</p>
                                            <p className="text-sm text-muted-foreground">
                                                Receive activity updates.
                                            </p>
                                        </div>
                                        <Switch 
                                            checked={notifications} 
                                            onCheckedChange={setNotifications} 
                                            className="data-[state=checked]:bg-blue-600"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                    </div>
                </div>
            </div>
        </motion.div>
    );
}