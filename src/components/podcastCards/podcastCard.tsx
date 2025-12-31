import { 
  School, 
  User, 
  Laptop, 
  Users, 
  Notebook, 
  Book, 
  Mic2, 
  Cpu 
} from "lucide-react"; // Using Lucide for a cleaner, consistent stroke
import PostcardPopover from "./podcastCardPopover";

export default function PodcastCard(props: any) {
  const s3Key = `private/${props.user}/audio/${props.data.podcastId}.mp3`;

  // Configuration for categories: icon, specific color, and soft background
  const categoryConfig: Record<string, { icon: any; color: string; bg: string }> = {
    "Class Work": { icon: School, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    "Personal Notes": { icon: User, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    "Lecture Notes": { icon: Laptop, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
    "Meeting Notes": { icon: Users, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    "Journal": { icon: Notebook, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20" },
    "Book Summaries": { icon: Book, color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-900/20" },
  };

  const config = categoryConfig[props.data.category] || { icon: Mic2, color: "text-slate-600", bg: "bg-slate-100" };
  const IconComponent = config.icon;

  return (
    <div className="group relative p-6 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900/50 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 w-full min-w-[320px] max-w-[440px] h-64 flex flex-col justify-between overflow-hidden">
      
      {/* Decorative Background Glow */}
      <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20 ${config.bg}`} />

      <div className="flex flex-row justify-between items-start relative z-10">
        <div className={`p-4 rounded-xl ${config.bg} ${config.color} transition-transform duration-500 group-hover:rotate-6 group-hover:scale-110`}>
          <IconComponent size={28} strokeWidth={2} />
        </div>
        
        <PostcardPopover 
          podcastName={props.data.podcastName} 
          category={props.data.category} 
          dynamoClient={props.dynamoClient} 
          user={props.user} 
          podcastId={props.data.podcastId} 
          updatePodcast={props.updatePodcast} 
          deletePodcast={props.deletePodcast}
          s3Client={props.s3Client}
          s3Key={s3Key}
        />
      </div>

      <div className="relative z-10">
        <h3 className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
          {props.data.podcastName}
        </h3>
        
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md ${config.bg} ${config.color}`}>
            {props.data.category}
          </span>
        </div>

        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Cpu size={14} className="opacity-70" />
            <span className="text-xs font-medium">{props.data.engine}</span>
          </div>
          
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Mic2 size={14} className="opacity-70" />
            <span className="text-xs font-medium">{props.data.voice}</span>
          </div>
        </div>
      </div>
    </div>
  );
}