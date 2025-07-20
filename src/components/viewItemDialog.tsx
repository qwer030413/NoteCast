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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import PodcastCard from "./podcastCard"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { useEffect, useState, type JSX } from "react";
import {GetObjectCommand } from "@aws-sdk/client-s3";
export default function ViewItemDialog(props:any) {
    const [signedUrl, setSignedUrl] = useState("");
    useEffect(() => {
        async function generateUrl() {
            try {
                const audioKey = `private/us-east-2:7c29331f-e3cb-ceb6-73db-108d79f8723d/audio/${props.user}/${props.data.podcastId}.mp3`;
                const command = new GetObjectCommand({
                    Bucket: "note-cast-user",
                    Key: audioKey,
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
        <div className="">
            <PodcastCard  data={props.data}  s3Client={props.s3Client} user={props.user}/>
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
                <div className="w-full p-2 bg-gray-800 rounded-lg shadow-md">
                    <audio
                    controls
                    src={signedUrl}
                    className="w-full rounded-md outline-none"
                    />
                </div>
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
            >Download Podcast</Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  )
}
