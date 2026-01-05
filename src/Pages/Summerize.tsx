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

type Message = {
  role: "user" | "assistant";
  content: string;
};

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

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="min-h-screen w-full flex flex-col bg-background text-foreground"
    >
      <motion.div variants={itemVariants} className="flex-1 w-full flex flex-col items-center">
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