import { useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import ViewItemDialog from "./viewItemDialog";


export default function RecentPodcasts(props:any){
    function simplifyDynamoItem(item: any) {
        return {
            podcastId: item.podcastId?.S,
            userName: item.userName?.S,
            podcastName: item.podcastName?.S,
            createdAt: item.createdAt?.S,
            category: item.category?.S,
            engine: item.engine?.S,
            voice: item.voice.S
        };
    }
    const simplified = props.podcasts?.slice(0, 6).map(simplifyDynamoItem);
    const isLoading = props.loading;
    const isEmpty = !isLoading && simplified.length === 0;
    const renderSkeletonCard = () => (
        <div className="p-6 border rounded-lg shadow bg-card w-[30%] h-60 min-w-89 cursor-pointer">
            <div className="flex flex-row justify-between">
                <Skeleton className="h-15 w-15 rounded-sm mt-4" />
                <Skeleton className="h-8 w-4" />
            </div>

            <Skeleton className="h-6 w-3/4 mt-6" />

            <div className="flex flex-row mt-6 gap-2 items-center">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-16" />
            </div>
        </div>
    );
    return(
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6">

            {isLoading
                ? [...Array(6)].map((_, index) => (
                      <div key={index}>{renderSkeletonCard()}</div>
                  ))
                : isEmpty ? (
                    <p className="text-gray-500 text-sm col-span-3 text-center h-100 flex items-center justify-center">
                        No podcasts to show.
                    </p>
                )
                : simplified.map((podcast: any, index: number) => (
                    <ViewItemDialog key={index} data={podcast}  s3Client={props.s3Client} user={props.user} dynamoClient = {props.dynamoClient} updatePodcast = {props.updatePodcast} deletePodcast = {props.deletePodcast}/>
                  ))}
        </div>
    );
}