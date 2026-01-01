import { format } from "date-fns";
import { 
  School, 
  User, 
  Laptop, 
  Users, 
  Notebook, 
  Book, 
  FileText
} from "lucide-react"; // Using Lucide for consistent line weights
import FilePopOver from "./filePopOver";

export default function FileRow(props: any) {
  const s3Key = `private/${props.user}/notes/${props.fileId.S}.txt`;

  const categoryConfig: Record<string, { icon: any; color: string; bg: string }> = {
    "Class Work": { icon: School, color: "text-blue-600", bg: "bg-blue-50 dark:bg-blue-900/20" },
    "Personal Notes": { icon: User, color: "text-emerald-600", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
    "Lecture Notes": { icon: Laptop, color: "text-amber-600", bg: "bg-amber-50 dark:bg-amber-900/20" },
    "Meeting Notes": { icon: Users, color: "text-indigo-600", bg: "bg-indigo-50 dark:bg-indigo-900/20" },
    "Journal": { icon: Notebook, color: "text-rose-600", bg: "bg-rose-50 dark:bg-rose-900/20" },
    "Book Summaries": { icon: Book, color: "text-cyan-600", bg: "bg-cyan-50 dark:bg-cyan-900/20" },
  };

  const config = categoryConfig[props.category] || { icon: FileText, color: "text-slate-500", bg: "bg-slate-50" };
  const IconComponent = config.icon;

  return (
    <div className="group grid grid-cols-[2.5fr_1.2fr_1.2fr_1fr_auto] items-center px-6 py-4 transition-all hover:bg-slate-50/80 dark:hover:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800 last:border-none cursor-pointer">
      
      {/* name */}
      <div className="flex items-center gap-4">
        <div className={`flex items-center justify-center p-2.5 rounded-xl ${config.bg} ${config.color} transition-transform group-hover:scale-110`}>
          <IconComponent size={18} strokeWidth={2.5} />
        </div>
        <div className="flex flex-col">
          <span className="font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[180px]">
            {props.fileName?.S || "Untitled Note"}
          </span>
        </div>
      </div>

      {/* category */}
      <div className="px-2">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${config.bg} ${config.color} border-current/10`}>
          {props.category}
        </span>
      </div>

      {/* Origin file */}
      <div className="flex items-center gap-2 text-slate-500 text-xs px-2">
        <FileText size={14} className="opacity-40" />
        <span className="truncate max-w-[120px] italic">
          {props.fileNameActual?.S || "Direct Entry"}
        </span>
      </div>

      {/* Timestamp */}
      <div className="text-slate-400 text-xs font-medium px-2">
        {props.createdAt?.S ? (
          <div className="flex flex-col">
            <span>{format(new Date(props.createdAt.S), "MMM dd, yyyy")}</span>
            <span className="text-[10px] opacity-60">{format(new Date(props.createdAt.S), "HH:mm")}</span>
          </div>
        ) : "—"}
      </div>

      {/* actions */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <FilePopOver 
          fileName={props.fileName} 
          category={props.category} 
          dynamoClient={props.dynamoClient} 
          user={props.user} 
          fileId={props.fileId} 
          updateFile={props.updateFile} 
          deleteFile={props.deleteFile}
          s3Client={props.s3Client}
          s3Key={s3Key}
        />
      </div>
    </div>
  );
}