import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { S3Client } from "@aws-sdk/client-s3";
import EmptyState from "../noData/EmptyState";
import FileDialog from "./fileDialog";
import { FileText, Clock, Tag, Paperclip } from "lucide-react";

export default function RecentFiles(props:any) {
  const recentFiles = props.files.slice(0, 10);
    
  return (
    <Card className="mt-8 overflow-hidden border-slate-200/60 dark:border-slate-800/60 shadow-sm transition-all w-full dark:bg-slate-800/30">
      <CardHeader className="border-b px-6 py-4">
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
          {/* Table Header: Sticky and Glassy */}
          <div className="grid grid-cols-[2.5fr_1.2fr_1.2fr_1fr_auto] gap-4 px-6 py-3 sticky top-0 z-20 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">
            <HeaderLabel icon={<FileText size={12}/>} label="File Name" />
            <HeaderLabel icon={<Tag size={12}/>} label="Category" />
            <HeaderLabel icon={<Paperclip size={12}/>} label="Source" />
            <HeaderLabel icon={<Clock size={12}/>} label="Uploaded" />
            <div className="w-8"></div>
          </div>

          <div className="divide-y divide-slate-50 dark:divide-slate-900">
            {recentFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 opacity-60">
                <EmptyState />
              </div>
            ) : (
              recentFiles.map((file: any, index: number) => {
                const category = file.category?.S || "Uncategorized";
                return (
                  <div key={file.fileId.S} className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/30">
                    <FileDialog 
                      dynamoClient={props.dynamoClient} 
                      fileId={file.fileId} 
                      category={category} 
                      fileNameActual={file.fileNameActual} 
                      createdAt={file.createdAt} 
                      index={index} 
                      fileName={file.fileName} 
                      s3Client={props.s3Client} 
                      user={props.user} 
                      deleteFile={props.deleteFile} 
                      updateFile={props.updateFile}
                    />
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

function HeaderLabel({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
      {icon}
      {label}
    </div>
  );
}
