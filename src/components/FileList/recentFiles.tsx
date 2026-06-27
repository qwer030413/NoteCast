import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton"; // Import this for a better experience
import EmptyState from "../noData/EmptyState";
import FileDialog from "./fileDialog";
import { FileText, Clock, Tag, Paperclip } from "lucide-react";
import { AnimatePresence, motion, type Variants } from "framer-motion";

const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};

const rowVariants: Variants = {
  hidden: { x: -10, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 20 }
  }
};

export default function RecentFiles(props: any) {
  const files = props.files || [];
  const recentFiles = files.slice(0, 10);
  const isLoading = props.loading; 

  return (
    <Card className="mt-8 overflow-hidden border-slate-200/60 dark:border-slate-800/60 shadow-sm transition-all w-full dark:bg-slate-800/30">
      <CardHeader className="border-b px-6 py-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-bold flex items-center gap-2.5 tracking-tight text-slate-800 dark:text-slate-100">
            <div className="p-1.5 bg-blue-500/10 rounded-md">
              <FileText className="size-5 text-blue-600" />
            </div>
            Recent Uploads
          </CardTitle>
          <span className="text-xs font-medium text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full">
            {recentFiles.length} total
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="grid grid-cols-[2.5fr_1.2fr_1.2fr_1fr_auto] px-6 py-4 sticky top-0 z-20 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80">
            <HeaderLabel icon={<FileText size={12}/>} label="File Name" />
            <HeaderLabel icon={<Tag size={12}/>} label="Category" />
            <HeaderLabel icon={<Paperclip size={12}/>} label="Source" />
            <HeaderLabel icon={<Clock size={12}/>} label="Created At" />
            <div className="w-8"></div>
          </div>

          <div className="divide-y divide-slate-50 dark:divide-slate-900">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="p-6 space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full bg-slate-100 dark:bg-slate-800" />
                  ))}
                </motion.div>
              ) : recentFiles.length === 0 ? (
                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center h-64 opacity-60">
                  <EmptyState />
                </motion.div>
              ) : (
                <motion.div
                  key="list"
                  variants={listVariants}
                  initial="hidden"
                  animate="visible"
                >
                  {recentFiles.map((file: any, index: number) => {
                    const category = file.category?.S || "Uncategorized";
                    return (
                      <motion.div 
                        key={file.fileId?.S || index} 
                        variants={rowVariants}
                        className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                      >
                        <FileDialog 
                          dynamoClient={props.dynamoClient} 
                          fileId={file.fileId} 
                          category={category} 
                          fileNameActual={file.fileNameActual} 
                          storageKey={file.storageKey}
                          fileType={file.fileType}
                          sourceSize={file.sourceSize}
                          createdAt={file.createdAt} 
                          index={index} 
                          fileName={file.fileName} 
                          s3Client={props.s3Client} 
                          user={props.user} 
                          deleteFile={props.deleteFile} 
                          updateFile={props.updateFile}
                        />
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function HeaderLabel({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 inline-flex items-center px-2.5 py-0.5">
      {icon}
      {label}
    </div>
  );
}
