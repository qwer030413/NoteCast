import { format } from "date-fns";

import {type JSX } from "react";

export default function FileRow(props:any){
    const categoryIcons: Record<string, JSX.Element> = {
        "Class Work": (
            <div className="inline-block bg-secondary p-3 rounded-sm">
            <svg  xmlns="http://www.w3.org/2000/svg"  width="20"  height="20"  viewBox="0 0 24 24"  fill="none"  stroke="currentColor"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-school">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M22 9l-10 -4l-10 4l10 4l10 -4v6" />
            <path d="M6 10.6v5.4a6 3 0 0 0 12 0v-5.4" />
            </svg>
            </div>
        ),
        "Personal Notes": (
            <div className="inline-block bg-secondary p-3 rounded-sm ">
            <svg  xmlns="http://www.w3.org/2000/svg"  width="20"  height="20"  viewBox="0 0 24 24"  fill="none"  stroke="#588157"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-user">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
            <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
            </svg>
            </div>
        ),
        "Lecture Notes": (
            <div className="inline-block bg-secondary p-3 rounded-sm">
            <svg  xmlns="http://www.w3.org/2000/svg"  width="20"  height="20"  viewBox="0 0 24 24"  fill="none"  stroke="#f9dc5c"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-device-laptop">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M3 19l18 0" />
            <path d="M5 6m0 1a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v8a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1z" />
            </svg>
            </div>
        ),
        "Meeting Notes": (
            <div className="inline-block bg-secondary p-3 rounded-sm">
            <svg  xmlns="http://www.w3.org/2000/svg"  width="20"  height="20"  viewBox="0 0 24 24"  fill="none"  stroke="#4361ee"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-users"><path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M9 7m-4 0a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
            <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
            </svg>
            </div>
        ),
        "Journal": (
            <div className="inline-block bg-secondary p-3 rounded-sm">
            <svg  xmlns="http://www.w3.org/2000/svg"  width="20"  height="20"  viewBox="0 0 24 24"  fill="none"  stroke="#f25c54"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-notebook">
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M6 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1 -2 2h-11a1 1 0 0 1 -1 -1v-14a1 1 0 0 1 1 -1m3 0v18" />
            <path d="M13 8l2 0" />
            <path d="M13 12l2 0" />
            </svg>
            </div>
        ),
        "Book Summaries": (
            <div className="inline-block bg-secondary p-3 rounded-sm">
            <svg  xmlns="http://www.w3.org/2000/svg"  width="20"  height="20"  viewBox="0 0 24 24"  fill="none"  stroke="#48cae4"  strokeWidth="2"  strokeLinecap="round"  strokeLinejoin="round"  className="icon icon-tabler icons-tabler-outline icon-tabler-book"><path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
            <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
            <path d="M3 6l0 13" /><path d="M12 6l0 13" />
            <path d="M21 6l0 13" />
            </svg>
            </div>
        )
    };
    return(
        <div
            className="grid grid-cols-4 items-center px-4 py-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer"
        >
            <div className="flex items-center gap-3">
            {categoryIcons[props.category] || ""}
            <span className="font-medium">{props.fileName?.S || "Untitled"}</span>
            </div>

            <div>{props.category}</div>

            <div className="text-muted-foreground">
            {props.fileNameActual?.S || "N/A"}
            </div>

            <div>
            {props.createdAt?.S
                ? format(new Date(props.createdAt.S), "MMM dd, yyyy HH:mm")
                : ""}
            </div>
        </div>
    );
}