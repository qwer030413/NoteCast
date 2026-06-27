import { useState, useEffect } from "react";
import ChatRoom from "@/components/AIChatBot/ChatRoom";
import ChatInput from "@/components/AIChatBot/ChatInput";
import { RetrieveAndGenerateCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import { useAwsClients } from "@/aws/ClientProvider";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { StartIngestionJobCommand } from "@aws-sdk/client-bedrock-agent";
import { useAuth } from "@/aws/AuthProvider";
import { motion, type Variants} from "framer-motion";
import { Button } from "@/components/ui/button";
import { BookOpenCheck, CheckSquare, Download, Layers3, ListChecks, WandSparkles } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

const summaryModes = [
  { label: "Brief", icon: WandSparkles, prompt: "Give me a concise summary with the 5 most important points." },
  { label: "Study Guide", icon: BookOpenCheck, prompt: "Create a study guide with headings, key concepts, and definitions." },
  { label: "Quiz Me", icon: CheckSquare, prompt: "Create 8 quiz questions with answers from this document." },
  { label: "Key Terms", icon: Layers3, prompt: "Extract key terms and explain each in one sentence." },
  { label: "Action Items", icon: ListChecks, prompt: "Find action items, decisions, and follow-up tasks." },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 }, 
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" }
  },
};

export default function Summarize() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dbFiles, setDbFiles] = useState<any[]>([]); 
  const [selectedFileId, setSelectedFileId] = useState<string>("all");
  const { bedrockAgentRuntime, bedrockAgent, s3Client, dynamoClient } = useAwsClients();
  const { user } = useAuth();

  useEffect(() => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  useEffect(() => {
    const fetchUserFiles = async () => {
      if (!user || !dynamoClient) return;
      try {
        const command = new QueryCommand({
          TableName: "UserFiles",
          KeyConditionExpression: "userName = :user",
          ExpressionAttributeValues: { ":user": { S: user } },
        });
        const response = await dynamoClient.send(command);
        setDbFiles(response.Items || []);
      } catch (err) {
        console.error("Failed to fetch files for dropdown", err);
      }
    };
    fetchUserFiles();
  }, [user, dynamoClient]);

  const handleSend = async () => {
    if (!input.trim() && !file && (!selectedFileId || selectedFileId === "all")) return;
    if (!bedrockAgentRuntime || !s3Client || !bedrockAgent) return;

    setLoading(true);
    const userMessageContent = input || (file ? `Analyze ${file.name}` : "Summarize document");
    setMessages((prev) => [...prev, { role: "user", content: userMessageContent }]);
    
    const currentInput = input;
    setInput("");

    try {
        let currentFileId = selectedFileId;
        if (file) {
            if (!window.confirm("Uploading a new chat file will write to S3 and start one Bedrock ingestion job. Continue?")) {
                setLoading(false);
                return;
            }
            const fileId = `file-${Date.now()}`;
            const key = `inputs/${file.name}`;
            
            await s3Client.send(new PutObjectCommand({
                Bucket: 'note-cast-user',
                Key: key,
                Body: file,
            }));

            const metadata = {
                metadataAttributes: {
                    file_id: fileId,
                    user_id: user   
                }
            };
            await s3Client.send(new PutObjectCommand({
                Bucket: 'note-cast-user',
                Key: `${key}.metadata.json`,
                Body: JSON.stringify(metadata),
            }));

            await bedrockAgent.send(new StartIngestionJobCommand({
                knowledgeBaseId: 'ZEYGFYPU3S',
                dataSourceId: '10Z5LEVPS5',
            }));

            currentFileId = fileId;
            setFile(null);
            
            setMessages(prev => [...prev, { 
                role: "assistant", 
                content: "I've received the file! It's being indexed. This usually takes about 30 seconds..." 
            }]);
        }

        const filters: any[] = [{ equals: { key: "user_id", value: user } }];
        if (currentFileId && currentFileId !== "all") {
            filters.push({ equals: { key: "file_id", value: currentFileId } });
        }

        const command = new RetrieveAndGenerateCommand({
            input: { text: currentInput || "Summarize this document" },
            retrieveAndGenerateConfiguration: {
                type: "KNOWLEDGE_BASE",
                knowledgeBaseConfiguration: {
                    knowledgeBaseId: 'ZEYGFYPU3S',
                    modelArn: "arn:aws:bedrock:us-east-2:533267161059:inference-profile/global.amazon.nova-2-lite-v1:0",
                    retrievalConfiguration: {
                        vectorSearchConfiguration: {
                            filter: filters.length > 1 ? { andAll: filters } : filters[0]
                        }
                    }
                }
            }
        });

        const response = await bedrockAgentRuntime.send(command);
        setMessages((prev) => [...prev, { 
            role: "assistant", 
            content: response.output?.text || "I found the document but couldn't generate a summary." 
        }]);

    } catch (error) {
        console.error("RAG Error:", error);
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I encountered an error." }]);
    } finally {
        setLoading(false);
    }
  };

  const exportChat = () => {
    const content = messages.map((message) => `## ${message.role === "user" ? "You" : "Assistant"}\n\n${message.content}`).join("\n\n");
    const blob = new Blob([content || "# NoteCast Summary\n"], { type: "text/markdown" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `notecast-summary-${new Date().toISOString().slice(0, 10)}.md`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen w-full flex flex-col bg-background text-foreground"
    >
      <motion.div variants={itemVariants} className="flex-1 w-full flex flex-col items-center">
        <div className="w-full max-w-3xl px-4 pt-8 flex flex-wrap items-center gap-2">
          {summaryModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <Button
                key={mode.label}
                type="button"
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => setInput(mode.prompt)}
              >
                <Icon className="size-4" />
                {mode.label}
              </Button>
            );
          })}
          <Button type="button" variant="ghost" size="sm" className="ml-auto gap-2" onClick={exportChat}>
            <Download className="size-4" />
            Export
          </Button>
        </div>
        <ChatRoom messages={messages} loading={loading}/>
      </motion.div>

      <motion.div
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.3 }}
      className="w-full flex justify-center pb-6">
        <ChatInput 
          setFile={setFile} 
          setInput={setInput} 
          file={file} 
          input={input} 
          loading={loading} 
          handleSend={handleSend} 
          dbFiles={dbFiles} 
          selectedFileId={selectedFileId} 
          setSelectedFileId={setSelectedFileId}
        />
      </motion.div>
    </motion.div>
  );
}
