import { Button } from "@/components/ui/button";
import {useEffect, useState } from "react";
// import { useNavigate } from "react-router-dom";
import { getCurrentUser } from '@aws-amplify/auth'
import toast from "react-hot-toast";
import { getUrl, uploadData } from "@aws-amplify/storage";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DynamoDBClient, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { fetchAuthSession } from '@aws-amplify/auth';
import { PollyClient, SynthesizeSpeechCommand, DescribeVoicesCommand} from "@aws-sdk/client-polly";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import DropDownMenu from "@/components/dropdownMenu";



export default function Home(){
    // const navigate = useNavigate()
    const [categoryValue, setCategoryValue] = useState("")    
    const [engine, setEngine] = useState<"standard" | "neural">("standard")   
    const [voice, setVoice] = useState("")   
    const [voices, setVoices] = useState<{ value: string; label: string }[]>([]);
    const [user, setUser] = useState("")
    const [dynamoClient, setDynamoClient] = useState<DynamoDBClient | null>(null);
    const [pollyClient, setPollyClient] = useState<PollyClient | null>(null);
    const categories = [
        {
            value: "class work",
            label: "Class Work",
        },
        {
            value: "personal notes",
            label: "Personal Notes",
        },
        {
            value: "lecture notes",
            label: "Lecture Notes",
        },
        {
            value: "meeting notes",
            label: "Meeting Notes",
        },
        {
            value: "journal",
            label: "Journal",
        },
        {
            value: "book summaries",
            label: "Book Summaries",
        }
    ]
    const engines = [
        {
            value: "standard",
            label: "Standard",
        },
        {
            value: "neural",
            label: "Neural: More natural ",
        },
        {
            value: "long-form",
            label: "Long-Form: Natural speech for longer text",
        },
        {
            value: "generative",
            label: "Generative: Expressive and adaptive speech",
        },
    ]
    useEffect(() => {
    const setUpClient = async () => {
        try {
            const session = await fetchAuthSession();
            const credentials = session.credentials;

            if (!credentials) {
            throw new Error("No credentials found");
            }

            const client = new DynamoDBClient({
            region: 'us-east-2',
            credentials: {
                accessKeyId: credentials.accessKeyId,
                secretAccessKey: credentials.secretAccessKey,
                sessionToken: credentials.sessionToken,
            },
            });
            const pollyClient = new PollyClient({
                region: 'us-east-1',
                credentials: {
                accessKeyId: credentials.accessKeyId,
                secretAccessKey: credentials.secretAccessKey,
                sessionToken: credentials.sessionToken,
                },
            });
            setPollyClient(pollyClient)
            setDynamoClient(client);
        } catch (err) {
            console.error("Failed to configure DynamoDB client:", err);
        }
    };

    setUpClient();
    }, []);
    useEffect(() => {
        getCurrentUser()
        .then((user) => {
            setUser(user.username)
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
    const fetchVoices = async (engine: "standard"|"neural") => {
        const command = new DescribeVoicesCommand({
            Engine : engine
        })
        if(!pollyClient){
            return;
        }
        try{
            const data = await pollyClient.send(command)
            console.log(data)
            return data.Voices || []
        }
        catch(err){
            console.log(err)
            return []
        }
    }

    useEffect(() => {
        const loadVoices = async () => {
            const voiceList = await fetchVoices(engine);
            if(voiceList){
                const voiceOptions = voiceList.map((voice) => ({
                    value: voice.Id ?? "",
                    label: `${voice.Name} (${voice.Gender})`,
                }));
                setVoices(voiceOptions ?? []);
            }
        };
        loadVoices();
    }, [engine, pollyClient])
    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const username = user
        const fileNameEntry = formData.get("name");
        const fileName = typeof fileNameEntry === "string" ? fileNameEntry : "";
        const file = formData.get("file") as File;
        console.log(file)
        if (!username || !file || !fileName) {
            toast.error("Please fill in all fields.");
            return;
        }
        if (!dynamoClient || !pollyClient) {
            toast.error("client is not initialized.");
            return;
        }
        const noteId = uuidv4();
        const podcastId = uuidv4();
        const key = `notes/${username}/${noteId}.txt`;
        const audioKey = `audio/${username}/${noteId}.mp3`;

        try {
            // Upload file to S3
            await uploadData({
            key,
            data: file,
            options: {
                contentType: file.type,
                accessLevel: "private",
            },
            }).result;

            const { url } = await getUrl({ key, options: { accessLevel: 'private' } });
            const { url: audioUrl } = await getUrl({ key: audioKey, options: { accessLevel: "private" } });
            const fileText = await file.text();
            const pollyCommand = new SynthesizeSpeechCommand({
                OutputFormat: "mp3",
                Text: fileText,
                VoiceId: "Joanna",
                Engine: engine
            });
            const pollyResponse = await pollyClient.send(pollyCommand)
            const audioStream = pollyResponse.AudioStream
            if(!audioStream){
                throw new Error("Polly did not return audio")
            }
            const arrayBuffer = await audioStream.transformToByteArray();
            const audioBlob = new Blob([arrayBuffer], {type: "audio/mpeg"})
            await uploadData({
            key: audioKey,
            data: audioBlob,
            options: {
                contentType: "audio/mpeg",
                accessLevel: "private",
            },
            }).result;
            const command = new PutItemCommand({
            TableName: "UserFiles",
            Item: {
                fileId: { S: noteId },
                userName: { S: username },
                s3Url: { S: url.toString() },
                fileName: { S: fileName },
                createdAt:  { S: new Date().toISOString() },
                audioUrl: { S: audioUrl.toString() },
            },
            });
            const AudioCommand = new PutItemCommand({
            TableName: "UserPodcasts",
            Item: {
                podcastId: { S: podcastId },
                userName: { S: username },
                s3Url: { S: audioUrl.toString() },
                fileName: { S: fileName },
                createdAt:  { S: new Date().toISOString() },
                fileUrl: { S: url.toString() },
            },
            });
            await dynamoClient.send(command);
            await dynamoClient.send(AudioCommand);
            toast.success("Note uploaded and saved successfully!");
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Upload failed");
        }
        };
    return(
        <div className="flex w-full h-full">
            <div className="flex-1 p-10 overflow-auto">
                <div className="flex justify-between items-center align-center">
                    <h1 className="text-lg">Recent Podcasts</h1>
                        <Dialog>
                            <DialogTrigger asChild>
                            <Button variant="default" className="p-7 text-md w-60">
                                <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-upload"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 9l5 -5l5 5" /><path d="M12 4l0 12" /></svg>
                                Add New File
                            </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                                <DialogTitle>Add File</DialogTitle>
                                <DialogDescription>
                                Upload new files for Note Cast to convert into podcasts!
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleUpload}>
                            <div className="grid gap-4 mb-6">
                                <div className="grid gap-3">
                                <Label htmlFor="name-1">Name</Label>
                                <Input id="name" name="name"/>
                                </div>
                                <div className="grid gap-3">
                                <Label htmlFor="file">File</Label>
                                <Input id="file" type="file" name="file" />
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="name-1">Category</Label>
                                    <DropDownMenu value = {categoryValue} categories = {categories} setValue = {setCategoryValue} name = {"Select Category..."} search = {"Search Categories.."} notFound = {"No Category Found"}/>
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="name-1">Engine</Label>
                                    <DropDownMenu value = {engine} categories = {engines} setValue = {setEngine} name = {"Select Engine..."} search = {"Search Engines.."} notFound = {"No Engine Found"}/>
                                </div>
                                <div className="grid gap-3">
                                    <Label htmlFor="name-1">Voice</Label>
                                    <DropDownMenu value = {voice} categories = {voices} setValue = {setVoice} name = {"Select Category..."} search = {"Search Categories.."} notFound = {"No Category Found"}/>
                                </div>
                            </div>
                            
                            <DialogFooter>
                                <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button type="submit">Upload File</Button>
                            </DialogFooter>
                            </form>
                            </DialogContent>
                        
                        </Dialog>
                </div>
                <div>Boxes</div>
                <div className="flex justify-between items-center align-center">
                    <h1 className="text-lg">Recent Uploads</h1>
                    
                </div>

            </div>
            <div className="w-[300px] min-w-[250px] bg-muted p-4 rounded-lg shadow">
            chart
            </div>
        </div>
    );
}
