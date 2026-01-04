import { useEffect, useState } from "react";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { 
  Download, 
  Headphones, 
  Waves,
} from "lucide-react";
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PodcastRow from "./podcastRow";

export default function ViewItemDialog(props: any) {
  const [signedUrl, setSignedUrl] = useState("");

  useEffect(() => {
    async function generateUrl() {
      try {
        const audioKey = `private/${props.user}/audio/${props.data.podcastId}.mp3`;
        const command = new GetObjectCommand({
          Bucket: "note-cast-user",
          Key: audioKey,
        });
        const url = await getSignedUrl(props.s3Client, command, { expiresIn: 3600 });
        setSignedUrl(url);
      } catch (error) {
        console.error("Error generating signed URL", error);
      }
    }
    generateUrl();
  }, [props.data, props.user, props.s3Client]);

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = signedUrl;
    link.download = `${props.data.podcastName}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className="w-full">
          <PodcastRow 
            data={props.data} 
            s3Client={props.s3Client} 
            user={props.user} 
            dynamoClient={props.dynamoClient} 
            updatePodcast={props.updatePodcast} 
            deletePodcast={props.deletePodcast}
          />
        </div>
      </DialogTrigger>

      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-none shadow-2xl bg-white dark:bg-slate-950">
        
        <div className="relative bg-slate-900 px-8 py-12 text-white overflow-hidden">
          {/* random waves I found*/}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <Waves className="absolute -right-10 -bottom-10 size-64 rotate-12" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            <div className="p-4 bg-blue-500/20 rounded-full border border-blue-500/30 backdrop-blur-sm shadow-inner">
              <Headphones className="size-10 text-blue-400" />
            </div>
            <div>
              <DialogTitle className="text-3xl font-black tracking-tight mb-2">
                {props.data.podcastName}
              </DialogTitle>
              <DialogDescription className="text-slate-400 text-base font-medium">
                {props.data.category} • {props.data.voice} Voice
              </DialogDescription>
            </div>
          </div>
        </div>

        {/* audio player from npm */}
        <div className="p-8">
          <div className="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
            <AudioPlayer
              src={signedUrl}
              showJumpControls={false}
              customAdditionalControls={[]}
              className="rounded-xl shadow-none border-none bg-transparent"
            />
          </div>
        </div>

        {/* footer */}
        <DialogFooter className="p-8 pt-0 flex flex-row items-center justify-between gap-4">
          <DialogClose asChild>
            <Button variant="ghost" className="px-6 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold">
              Close
            </Button>
          </DialogClose>
          
          <Button 
            className="px-8 bg-blue-600 hover:bg-blue-700 text-white gap-2.5 font-bold shadow-lg shadow-blue-500/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            onClick={handleDownload}
          >
            <Download size={20} />
            Download MP3
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}