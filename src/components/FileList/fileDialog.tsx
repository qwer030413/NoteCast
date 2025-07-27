import { Button } from "@/components/ui/button"
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
import {GetObjectCommand } from "@aws-sdk/client-s3";
import 'react-h5-audio-player/lib/styles.css';
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import "../components.css"
import FileRow from "./FileRow";
import { useEffect, useState } from "react";
export default function FileDialog(props:any) {
    const [signedUrl, setSignedUrl] = useState("");
    useEffect(() => {
        async function generateUrl() {
            try {
                const fileKey = `private/us-east-2:7c29331f-e3cb-ceb6-73db-108d79f8723d/notes/${props.user}/${props.fileId.S}.txt`;
                const command = new GetObjectCommand({
                    Bucket: "note-cast-user",
                    Key: fileKey,
                });
                const signedUrl = await getSignedUrl(props.s3Client, command, { expiresIn: 3600 });
                setSignedUrl(signedUrl)
            } catch (error) {
                console.error("Error generating signed URL", error);
            }
        }

        generateUrl();
    }, [props.fileId, props.s3Client, props.user, props.userPoolId]);
    const handleDownload = async () => {
        const response = await fetch(signedUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = props.fileNameActual?.S || "file.txt";
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    };
    return (
        <Dialog>
            <form>
            <DialogTrigger asChild>
            <div>
                <FileRow fileId={props.fileId} category = {props.category} fileNameActual = {props.fileNameActual} createdAt = {props.createdAt} fileName = {props.fileName}/>
            </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                <DialogTitle>{props.fileName.S}</DialogTitle>
                <DialogDescription>
                    Preview and download your Files
                </DialogDescription>
                </DialogHeader>
                <div className="border rounded-md p-4 max-h-80 overflow-auto bg-muted">
                {signedUrl ? (
                    props.fileNameActual?.S?.endsWith(".txt") ? (
                    <iframe
                        src={signedUrl}
                        className="w-full h-64 border rounded"
                        title="Text Preview"
                    />
                    ) : props.fileNameActual?.S?.endsWith(".pdf") ? (
                    <iframe
                        src={signedUrl}
                        className="w-full h-64 border rounded"
                        title="PDF Preview"
                    />
                    ) : (
                    <p>Preview not available. You can download the file instead.</p>
                    )
                ) : (
                    <p>Loading preview...</p>
                )}
                </div>
                <DialogFooter>
                <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                </DialogClose>
                    <Button 
                    type="submit"
                    variant="default"
                    onClick={handleDownload}
                    >
                    <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-download"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" /></svg>
                    Download File
                    </Button>
                </DialogFooter>
            </DialogContent>
            </form>
        </Dialog>
    )
}
