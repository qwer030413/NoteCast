import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {Send, FileText, Files} from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";

interface ChatInputProps {
  setFile: (file: File | null) => void;
  setInput: (input: string) => void;
  loading: boolean;
  handleSend: () => void;
  input : string;
  file: File | null;
  dbFiles: {
    id: { S: string };
    name: { S: string };
    category: { S: string };
    createdAt: { S: string };
    fileId: { S: string };
    fileName: { S: string };
    fileNameActual: { S: string };
    userName: { S: string };
  }[];
  selectedFileId: string;
  setSelectedFileId: (id: string) => void;
}
export default function ChatInput({setFile, setInput, loading, handleSend, input, file, dbFiles, selectedFileId, setSelectedFileId} : ChatInputProps){
  const selectedDbFile = dbFiles.find(f => f.fileId?.S === selectedFileId);
  const selectedDbFileName = selectedDbFile?.fileName?.S;
  return(
    <footer className="fixed bottom-0 w-full bg-gradient-to-t from-background via-background to-transparent pb-8 pt-10 px-4">
      <div className="max-w-3xl mx-auto">

        <div className="relative bg-muted/80 border border-border flex rounded-2xl p-1.5 flex gap-2 justify-center items-center">
          <div className="flex items-center">
              <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.txt,.md"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {/* <label 
              htmlFor="file-upload"
              className="p-3 hover:bg-background/50 rounded-xl cursor-pointer text-muted-foreground transition-all active:scale-95"
            >
              <Upload size={20} />
            </label> */}
            <Select 
              value={selectedFileId} 
              onValueChange={(val) => {
                setSelectedFileId(val);
                setFile(null);
              }}
              >
                <SelectTrigger className="w-auto border-0 bg-transparent p-3 hover:bg-background/80 rounded-xl focus:ring-0 shadow-none">
                    <Files size={20} className="text-muted-foreground" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="none" disabled className="text-xs text-muted-foreground">
                    Your Uploaded Documents
                    </SelectItem>
                    {dbFiles.map((f) => (
                    <SelectItem key={f.fileId?.S} value={f.fileId?.S}>
                        {f.fileName?.S}
                    </SelectItem>
                    ))}
                </SelectContent>
              </Select>
          </div>
          {(file || (selectedFileId && selectedFileId !== "all")) && (
            <div className="absolute -top-12 left-0 flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 px-3 py-1.5 rounded-lg text-xs text-blue-400 animate-in fade-in slide-in-from-bottom-2">
              <FileText size={14} />
              
              <span className="truncate max-w-[200px]">
                {file ? file.name : selectedDbFileName}
              </span>

              <button 
                onClick={() => {
                  setFile(null);
                  setSelectedFileId("all");
                }}
                className="ml-1 hover:text-white transition-colors p-0.5"
              >
                ✕
              </button>
            </div>
          )}
          <Textarea
            placeholder="Ask me to summarize your files..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="min-h-[52px] max-h-60 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent resize-none py-4 text-[15px]"
            rows={1}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          <Button
            onClick={handleSend}
            disabled={loading || (!input.trim() && !file)}
            size="icon"
            className="size-10 rounded-xl"
          >
            {loading ? <Spinner className="size-5"/> : <Send size={12} />}
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground/60 mt-3 font-medium">
          Summaries are AI-generated and should be verified for accuracy.
        </p>
      </div>
    </footer>
  );
}