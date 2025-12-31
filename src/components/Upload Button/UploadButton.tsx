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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import DropDownMenu from "@/components/podcastCards/dropdownMenu";
import { Checkbox } from "../ui/checkbox";
import { AnimatePresence, motion } from "framer-motion";
import {
    CloudUpload,
    FileText,
    Loader2,
    Sparkles,
    Music4,
    CheckCircle2,
    X
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useAwsClients } from "@/aws/ClientProvider";
import { useAuth } from "@/aws/AuthProvider";
import { uploadData } from "@aws-amplify/storage";
import { SynthesizeSpeechCommand, DescribeVoicesCommand } from "@aws-sdk/client-polly";
import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { StartIngestionJobCommand } from "@aws-sdk/client-bedrock-agent";
import { v4 as uuidv4 } from "uuid";

interface UploadButtonProps {
    onUploadSuccess: () => void;
}
export default function UploadButton({ onUploadSuccess }: UploadButtonProps) {
    const { dynamoClient, pollyClient, bedrockAgent } = useAwsClients();
    const { user } = useAuth();


    const [categoryValue, setCategoryValue] = useState("")
    const [engine, setEngine] = useState<"standard" | "neural">("standard")
    const [voice, setVoice] = useState("")
    const [voices, setVoices] = useState<{ value: string; label: string }[]>([]);
    const dialogCloseRef = useRef<HTMLButtonElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [shouldConvertAudio, setShouldConvertAudio] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const categories = [
        { value: "Class Work", label: "Class Work" },
        { value: "Personal Notes", label: "Personal Notes" },
        { value: "Lecture Notes", label: "Lecture Notes" },
        { value: "Meeting Notes", label: "Meeting Notes" },
        { value: "Journal", label: "Journal" },
        { value: "Book Summaries", label: "Book Summaries" },
    ];
    const engines = [
        { value: "standard", label: "Standard" },
        { value: "neural", label: "Neural: More natural" },
        { value: "long-form", label: "Long-Form: Natural speech for longer text" },
        { value: "generative", label: "Generative: Expressive and adaptive speech" },
    ]
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.[0]) {
            setSelectedFile(e.target.files[0]);
        }
    }
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }
    const handleDragLeave = () => setIsDragging(false);
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files?.[0]) {
            setSelectedFile(e.dataTransfer.files[0]);
        }
    }

    const clearFile = (e: React.MouseEvent) => {
        e.preventDefault();
        setSelectedFile(null);
    }
    const fetchVoices = async (engine: "standard" | "neural") => {
        const command = new DescribeVoicesCommand({
            Engine: engine
        })
        console.log(!pollyClient)
        if (!pollyClient) {
            return;
        }
        try {
            const data = await pollyClient.send(command)
            return data.Voices || []
        }
        catch (err) {
            console.log(err)
            return []
        }
    }
    useEffect(() => {
        const loadVoices = async () => {
            const voiceList = await fetchVoices(engine);
            if (voiceList) {
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
        const fileNameActual = file.name
        if (!username || !fileName || !categoryValue || file.name.trim() == '' || !file) {
            toast.error("Please fill in all fields.");
            return;
        }
        if (shouldConvertAudio && !voice) {
            toast.error("Please select a voice for your podcast.");
            return;
        }
        if (!dynamoClient || !pollyClient) {
            toast.error("client is not initialized.");
            return;
        }
        const noteId = uuidv4();
        const podcastId = uuidv4();
        const key = `private/${username}/notes/${noteId}.txt`;
        const audioKey = `private/${username}/audio/${podcastId}.mp3`;
        setIsUploading(true)
        try {
            // Upload file to S3
            await uploadData({
                path: key,
                data: file,
                options: {
                    contentType: file.type,
                },
            }).result;
            const metadataKey = `${key}.metadata.json`;
            const metadataContent = {
                metadataAttributes: {
                    user_id: username, // Critical for multi-tenant filtering
                    file_id: noteId,
                    category: categoryValue
                }
            };

            await uploadData({
                path: metadataKey,
                data: JSON.stringify(metadataContent),
                options: { contentType: "application/json" },
            }).result;
            const command = new PutItemCommand({
                TableName: "UserFiles",
                Item: {
                    fileId: { S: noteId },
                    userName: { S: username },
                    fileName: { S: fileName },
                    fileNameActual: { S: fileNameActual },
                    createdAt: { S: new Date().toISOString() },
                    category: { S: categoryValue }
                },
            });
            await dynamoClient.send(command);
            if (shouldConvertAudio) {
                const fileText = await file.text();
                const pollyCommand = new SynthesizeSpeechCommand({
                    OutputFormat: "mp3",
                    Text: fileText,
                    VoiceId: "Joanna",
                    Engine: engine
                });
                const pollyResponse = await pollyClient.send(pollyCommand)
                const audioStream = pollyResponse.AudioStream
                if (!audioStream) {
                    throw new Error("Polly did not return audio")
                }
                const arrayBuffer = await audioStream.transformToByteArray();
                const audioBlob = new Blob([arrayBuffer as BlobPart], { type: "audio/mpeg" })
                await uploadData({
                    path: audioKey,
                    data: audioBlob,
                    options: {
                        contentType: "audio/mpeg",
                    },
                }).result;
                const AudioCommand = new PutItemCommand({
                    TableName: "UserPodcasts",
                    Item: {
                        podcastId: { S: podcastId },
                        userName: { S: username },
                        podcastName: { S: fileName },
                        createdAt: { S: new Date().toISOString() },
                        category: { S: categoryValue },
                        engine: { S: engine },
                        voice: { S: voice }
                    },
                });
                await dynamoClient.send(AudioCommand);
            }
            if (bedrockAgent) {
                const syncCommand = new StartIngestionJobCommand({
                    knowledgeBaseId: "ZEYGFYPU3S",
                    dataSourceId: "10Z5LEVPS5",
                });
                await bedrockAgent.send(syncCommand);
            }
            toast.success("Note uploaded and saved successfully!");
            onUploadSuccess();
        } catch (err) {
            console.error("Upload error:", err);
            toast.error("Upload failed");
        } finally {
            if (dialogCloseRef.current) {
                dialogCloseRef.current.click();
            }
            setIsUploading(false)
            setEngine("standard")
            setVoice("")
            setCategoryValue("")
        }
    };
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button className="h-12 px-6 text-base font-medium shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] gap-2">
                    <CloudUpload size={18} />
                    Add New File
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none shadow-2xl">
                <DialogHeader className="p-6 pb-0">
                    <div className="flex items-center gap-2 mb-1">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                            <Sparkles className="size-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <DialogTitle className="text-xl font-bold">Upload & Convert</DialogTitle>
                    </div>
                    <DialogDescription className="text-slate-500 dark:text-slate-400">
                        Upload your notes and let Note Cast turn them into high-quality audio.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleUpload} className="p-6 pt-4 space-y-6">
                    <div className="space-y-4">
                        {/* File Name Input */}
                        <div className="grid gap-2">
                            <Label htmlFor="name" className="text-sm font-semibold tracking-tight">
                                Podcast Title
                            </Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Enter a name for your podcast..."
                                className="h-11 bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                            />
                        </div>

                        {/* Custom Dropzone Look */}
                        <div className="grid gap-2">
                            <Label className="text-sm font-semibold tracking-tight">Upload Document</Label>
                            <label
                                htmlFor="file"
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                className={`group relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl transition-all cursor-pointer 
                            ${isDragging ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' : ''}
                            ${selectedFile
                                        ? 'border-green-500 bg-green-50/30 dark:bg-green-900/10'
                                        : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:bg-blue-50/30'}`}
                            >
                                <div className="flex flex-col items-center justify-center text-center px-4">
                                    {selectedFile ? (
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="flex flex-col items-center gap-1"
                                        >
                                            <CheckCircle2 className="size-8 text-green-500 mb-1" />
                                            <p className="text-sm font-medium text-green-600 truncate max-w-[250px]">
                                                {selectedFile.name}
                                            </p>

                                            {/* Remove File Button */}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={clearFile}
                                                className="mt-1 h-7 px-2 text-[10px] text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1 uppercase font-bold"
                                            >
                                                <X size={12} />
                                                Remove
                                            </Button>
                                        </motion.div>
                                    ) : (
                                        <>
                                            <FileText className={`size-8 mb-2 transition-colors ${isDragging ? 'text-blue-500' : 'text-slate-300 group-hover:text-blue-400'}`} />
                                            <p className="text-sm text-slate-500">
                                                <span className="font-semibold text-blue-600">Click to upload</span> or drag and drop
                                            </p>
                                            <p className="text-xs text-slate-400 mt-1">TXT, or PDF</p>
                                        </>
                                    )}
                                </div>

                                {/* The actual input remains hidden */}
                                <input
                                    id="file"
                                    type="file"
                                    name="file"
                                    className="hidden"
                                    onChange={handleFileChange}
                                    accept=".txt,.pdf" // Limits file picker to these types
                                />
                            </label>
                        </div>

                        {/* category */}
                        <div className="grid gap-2">
                            <Label className="text-sm font-semibold tracking-tight">Category</Label>
                            <DropDownMenu value={categoryValue} categories={categories} setValue={setCategoryValue} />
                        </div>

                        {/* Polly stuff */}
                        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 overflow-hidden transition-all">
                            <div className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-1.5 bg-white dark:bg-slate-800 rounded-md border shadow-sm">
                                        <Music4 className="size-4 text-blue-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">AI Voice Conversion</p>
                                        <p className="text-[11px] text-slate-500">Enable high-quality text-to-speech</p>
                                    </div>
                                </div>
                                <Checkbox
                                    id="toggle-2"
                                    checked={shouldConvertAudio}
                                    onCheckedChange={(checked) => setShouldConvertAudio(checked === true)}
                                    className="size-5 rounded-md data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                                />
                            </div>

                            <AnimatePresence initial={false}>
                                {shouldConvertAudio && (
                                    <motion.div
                                        key="content"
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{
                                            height: "auto",
                                            opacity: 1,
                                            transition: {
                                                height: { type: "spring", stiffness: 300, damping: 30 },
                                                opacity: { duration: 0.2, delay: 0.1 }
                                            }
                                        }}
                                        exit={{
                                            height: 0,
                                            opacity: 0,
                                            transition: {
                                                height: { duration: 0.3 },
                                                opacity: { duration: 0.2 }
                                            }
                                        }}
                                    >
                                        <div className="px-4 pb-4 pt-2 space-y-4 border-t border-slate-100 dark:border-slate-800">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Engine</Label>
                                                    <DropDownMenu value={engine} categories={engines} setValue={setEngine} />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label className="text-[10px] uppercase font-bold text-slate-400">Voice</Label>
                                                    <DropDownMenu value={voice} categories={voices} setValue={setVoice} />
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    <DialogFooter className="flex items-center gap-3 mt-4">
                        <DialogClose asChild>
                            <Button
                                type="button"
                                variant="ghost"
                                className="flex-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
                                ref={dialogCloseRef}
                            >
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            type="submit"
                            disabled={isUploading}
                            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all active:scale-95"
                        >
                            {isUploading ? (
                                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</>
                            ) : (
                                <><CloudUpload className="mr-2 h-4 w-4" /> Upload File</>
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}