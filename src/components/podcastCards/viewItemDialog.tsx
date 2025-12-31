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
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';
import "../components.css"
import PodcastCard from "./podcastCard"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { useEffect, useState, type JSX } from "react";
import {GetObjectCommand } from "@aws-sdk/client-s3";
export default function ViewItemDialog(props:any) {
  const [signedUrl, setSignedUrl] = useState("");
  useEffect(() => {
      async function generateUrl() {
          try {
              const audioKey = `private/${props.user}/audio/${props.data.podcastId}.mp3`;
              const command = new GetObjectCommand({
                  Bucket: "note-cast-user",
                  Key: audioKey,
                  ResponseContentDisposition: 'attachment'
              });
              const signedUrl = await getSignedUrl(props.s3Client, command, { expiresIn: 3600 });
              setSignedUrl(signedUrl)
          } catch (error) {
              console.error("Error generating signed URL", error);
          }
      }

      generateUrl();
  }, [props.data]);
  return (
    <Dialog>
      <form>
        <DialogTrigger asChild>
        <div>
            <PodcastCard  data={props.data}  s3Client={props.s3Client} user={props.user} dynamoClient = {props.dynamoClient} updatePodcast = {props.updatePodcast} deletePodcast = {props.deletePodcast}/>
        </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{props.data.podcastName}</DialogTitle>
            <DialogDescription>
              Preview and download your podcast
            </DialogDescription>
          </DialogHeader>
            <div className="grid gap-4">
                    <AudioPlayer
                    src={signedUrl}
                    showJumpControls={false}

                    />
            </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
              <Button 
              type="submit"
              onClick={async () => {
                  const link = document.createElement('a');
                  link.href = signedUrl;
                  link.download = props.podcastName + ".mp3"; // or ".wav" depending on format
                  link.click();
              }}
              variant="default"
              >
              <svg  xmlns="http://www.w3.org/2000/svg"  width="24"  height="24"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-download"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2 -2v-2" /><path d="M7 11l5 5l5 -5" /><path d="M12 4l0 12" /></svg>
              Download Podcast
              </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
