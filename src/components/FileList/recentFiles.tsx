import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { S3Client } from "@aws-sdk/client-s3";

import FileDialog from "./fileDialog";


export default function RecentFiles(props:any) {
  const recentFiles = props.files.slice(0, 10);
    
  return (
    <Card className="mt-6 w-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold">Recent File Uploads</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[320px] rounded-md border">
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] font-medium text-sm bg-muted px-4 py-2 sticky top-0 z-10">
            <div>File Name</div>
            <div>Category</div>
            <div>Origin File</div>
            <div>Created At</div>
          </div>

          {recentFiles.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              No recent uploads
            </div>
          ) : (
            recentFiles.map((file: { category: { S: string; }; fileId: { S: any; }; fileNameActual: any; createdAt: any; fileName: any; }, index: any) => {
              const category = file.category?.S || "Uncategorized";
              return (
                <FileDialog dynamoClient = {props.dynamoClient} fileId={file.fileId} category = {category} fileNameActual = {file.fileNameActual} createdAt = {file.createdAt} index = {index} fileName = {file.fileName} key = {file.fileId.S} s3Client = {props.s3Client} user = {props.user} deleteFile = {props.deleteFile} updateFile = {props.updateFile}/>
              );
            })
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
