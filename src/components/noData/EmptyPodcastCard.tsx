import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

export default function EmptyPodcastCard({ onAction }: { onAction: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 border-2 border-dashed rounded-3xl bg-slate-50/50 dark:bg-slate-900/20 border-slate-200 dark:border-slate-800 w-full"
    >
      <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-10 text-blue-600 dark:text-blue-400"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 10l-4 4l6 6l4 -16l-18 7l4 2l2 6l3 -4" />
        </svg>
      </div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
        No podcasts or notes yet
      </h3>
      <p className="text-slate-500 dark:text-slate-400 max-w-sm mt-2 mb-6">
        Transform your study guides, meeting notes, or journals into immersive 
        audio experiences. Upload your first file to get started.
      </p>
      <Button onClick={onAction} className="gap-2 shadow-lg shadow-blue-500/20">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14"/></svg>
        Create Your First Podcast
      </Button>
    </motion.div>
  );
}