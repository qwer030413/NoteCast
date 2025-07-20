
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { useEffect, useState, type JSX } from "react";
import {GetObjectCommand } from "@aws-sdk/client-s3";

export default function PodcastCard(props:any){
    const [signedUrl, setSignedUrl] = useState("");
    const categoryIcons: Record<string, JSX.Element> = {
        "Class Work": (
            <div className="inline-block bg-secondary p-2 rounded-sm">
            <svg  xmlns="http://www.w3.org/2000/svg"  width="30"  height="30"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-school">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M22 9l-10 -4l-10 4l10 4l10 -4v6" />
            <path d="M6 10.6v5.4a6 3 0 0 0 12 0v-5.4" />
            </svg>
            </div>
        ),
        "Personal notes": (
            <svg xmlns="http://www.w3.org/2000/svg" width="30"  height="30" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="icon icon-tabler icon-tabler-user">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M8 7a4 4 0 1 1 8 0a4 4 0 0 1 -8 0" />
            <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
            </svg>
        ),
        "Lecture notes": (
            <svg xmlns="http://www.w3.org/2000/svg" width="30"  height="30" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="icon icon-tabler icon-tabler-chalkboard">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <rect x="3" y="4" width="18" height="12" rx="1" />
            <path d="M4 17l2 2" /><path d="M20 17l-2 2" />
            </svg>
        ),
        "Meeting notes": (
            <svg xmlns="http://www.w3.org/2000/svg" width="30"  height="30" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                className="icon icon-tabler icon-tabler-users">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <circle cx="9" cy="7" r="4" /><circle cx="17" cy="7" r="4" />
            <path d="M3 21v-2a4 4 0 0 1 4 -4h1" />
            <path d="M17 13a4 4 0 0 1 4 4v2" />
            <path d="M13 17h-4" />
            </svg>
        ),
        "Journal": (
            <div className="inline-block bg-secondary p-2 rounded-sm">
            <svg  xmlns="http://www.w3.org/2000/svg"  width="30"  height="30"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-notebook">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-11a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1m3 0v18" />
            <path d="M13 8l2 0" />
            <path d="M13 12l2 0" />
            </svg>
            </div>
        ),
        "Book summaries": (
            <svg  xmlns="http://www.w3.org/2000/svg"  width="30"  height="30"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-book"><path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
            <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
            <path d="M3 6l0 13" /><path d="M12 6l0 13" />
            <path d="M21 6l0 13" />
            </svg>
        )
    };
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

    return(
        <div className="p-4 border rounded-lg shadow bg-card w-[30%] h-60 min-w-80 cursor-pointer">
            {categoryIcons[props.data.category]}
            <h2 className="text-lg font-semibold">{props.data.podcastName}</h2>
            <p className="text-muted-foreground text-sm">{props.data.category}</p>
            <audio controls className="w-full bg-card rounded-lg" src={signedUrl} />
            <p>{props.data.engine}</p>
            <p>{props.data.voice}</p>
        </div>
    );
}