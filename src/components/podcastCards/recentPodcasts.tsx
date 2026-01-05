import { Skeleton } from "@/components/ui/skeleton";
import ViewItemDialog from "./viewItemDialog";

import EmptyPodcastCard from "../noData/EmptyPodcastCard";
import { useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
const containerVariants : Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1, // Each card appears 0.1s after the previous one
        }
    }
};

const cardVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
        y: 0, 
        opacity: 1,
        transition: { type: "spring", stiffness: 100, damping: 15 }
    }
};
export default function RecentPodcasts(props:any){
    const [isDialogOpen, setIsDialogOpen] = useState(false);
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
        <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50 w-full h-64 flex flex-col justify-between overflow-hidden">
            
            <div className="flex flex-row justify-between items-start">
                <Skeleton className="h-14 w-14 rounded-xl bg-slate-100 dark:bg-slate-800" />
                <Skeleton className="h-8 w-8 rounded-full bg-slate-100 dark:bg-slate-800" />
            </div>

            <div className="space-y-3">
                <Skeleton className="h-7 w-3/4 bg-slate-100 dark:bg-slate-800" />
                <Skeleton className="h-5 w-24 rounded-md bg-slate-100 dark:bg-slate-800" />
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Skeleton className="h-4 w-16 bg-slate-50 dark:bg-slate-800/50" />
                <Skeleton className="h-4 w-16 bg-slate-50 dark:bg-slate-800/50" />
            </div>
            
        </div>
    );
    return(
        <div className="w-full pt-5">
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6"
                    >
                        {[...Array(6)].map((_, index) => (
                            <div key={index}>{renderSkeletonCard()}</div>
                        ))}
                    </motion.div>
                ) : isEmpty ? (
                    <motion.div 
                        key="empty"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="h-100 flex items-center justify-center"
                    >
                        <EmptyPodcastCard onAction={() => setIsDialogOpen(true)} />
                    </motion.div>
                ) : (
                    <motion.div 
                        key="loaded"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 gap-6"
                    >
                        {simplified.map((podcast: any, index: number) => (
                            <motion.div key={podcast.podcastId || index} variants={cardVariants}>
                                <ViewItemDialog 
                                    data={podcast} 
                                    s3Client={props.s3Client} 
                                    user={props.user} 
                                    dynamoClient={props.dynamoClient} 
                                    updatePodcast={props.updatePodcast} 
                                    deletePodcast={props.deletePodcast}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}