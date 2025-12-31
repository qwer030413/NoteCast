
import { cn } from "@/lib/utils";
import {User, Bot} from "lucide-react";

interface ChatRoomProps {
  messages: { role: string; content: string }[];
  loading: boolean;
}

export default function ChatRoom({messages, loading} : ChatRoomProps){
    return(
        <div className="flex-1 w-full pt-20 pb-40">
        <div className="max-w-3xl mx-auto px-4">
          
          {messages.length === 0 && (
            <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
              <Bot size={48} className="text-muted-foreground/20" />
              <h2 className="text-2xl font-semibold">How can I help with your notes?</h2>
              <p className="text-muted-foreground max-w-sm text-sm">
                Select an uploaded file
              </p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={cn(
                "py-8 flex gap-4 md:gap-6 border-b border-border/50 last:border-0",
                msg.role === "assistant" ? "bg-muted/30 -mx-4 px-4 rounded-xl" : ""
              )}
            >
              <div className={cn(
                "size-8 rounded-full flex shrink-0 items-center justify-center mt-1",
                msg.role === "user" ? "bg-zinc-700" : "bg-blue-600"
              )}>
                {msg.role === "user" ? <User size={16} className="text-white" /> : <Bot size={16} className="text-white" />}
              </div>
              <div className="flex-1 space-y-2">
                <p className="font-bold text-[10px] uppercase tracking-widest text-muted-foreground">
                  {msg.role === "user" ? "You" : "Assistant"}
                </p>
                <div className="text-[15px] leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="py-8 flex gap-4 md:gap-6 animate-pulse">
              <div className="size-8 rounded-full bg-muted flex items-center justify-center shrink-0" />
              <div className="space-y-3 flex-1 pt-2">
                <div className="h-3 bg-muted rounded w-1/4" />
                <div className="h-3 bg-muted rounded w-3/4" />
              </div>
            </div>
          )}
        </div>
      </div>
    );
}