import PodcastCard from "./podcastCard";


export default function RecentPodcasts(props:any){
    console.log(props.podcasts)
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
    return(
        <div className="w-[100%] p-5 flex flex-wrap gap-4">
            {simplified.map((podcast: any, index: number) => (
                <PodcastCard key={index} data={podcast} s3Client = {props.s3Client} user={props.user}/>
            ))}
        </div>
    );
}