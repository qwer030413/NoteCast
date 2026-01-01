import { useEffect, useState } from "react";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { 
  Download, 
  FileText, 
  Loader2, 
  FileSearch,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import FileRow from "./FileRow";

export default function FileDialog(props: any) {
  const [signedUrl, setSignedUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function generateUrl() {
      try {
        setLoading(true);
        const fileKey = `private/${props.user}/notes/${props.fileId.S}.txt`;
        const command = new GetObjectCommand({
          Bucket: "note-cast-user",
          Key: fileKey,
        });
        const url = await getSignedUrl(props.s3Client, command, { expiresIn: 3600 });
        setSignedUrl(url);
      } catch (error) {
        console.error("Error generating signed URL", error);
      } finally {
        setLoading(false);
      }
    }
    generateUrl();
  }, [props.fileId, props.s3Client, props.user]);

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
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
      <DialogTrigger asChild>
        <div className="w-full">
          <FileRow {...props} />
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-4xl w-[95vw] p-0 overflow-hidden border-none shadow-2xl transition-all">
        <div className="bg-slate-50 dark:bg-slate-900/50 p-6 border-b">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <FileSearch className="size-5 text-blue-600" />
              </div>
              <DialogTitle className="text-xl font-bold tracking-tight">
                {props.fileName.S}
              </DialogTitle>
            </div>
            <DialogDescription className="flex items-center gap-2">
              <FileText size={14} />
              {props.fileNameActual?.S || "Document"}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-6">
          <div className="relative w-full h-[450px] bg-slate-50 dark:bg-slate-950 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 overflow-hidden flex items-center justify-center">
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="size-8 text-blue-500 animate-spin" />
                <p className="text-xs font-medium text-slate-400">Fetching preview...</p>
              </div>
            ) : signedUrl ? (
              <iframe
                src={signedUrl}
                className="w-full h-full border-none"
                title="File Preview"
              />
            ) : (
              <div className="text-center p-8 text-slate-400">
                <AlertCircle className="size-10 mx-auto mb-3 opacity-20" />
                <p className="text-sm font-medium">Preview unavailable</p>
                <p className="text-xs mt-1">Try downloading the file to view it.</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-6 pt-0 flex items-center gap-3">
          <DialogClose asChild>
            <Button variant="ghost" className="flex-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
              Close
            </Button>
          </DialogClose>
          
          <Button 
            className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white gap-2 font-bold shadow-lg shadow-blue-500/20"
            onClick={handleDownload}
            disabled={!signedUrl}
          >
            <Download size={18} />
            Download File
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}