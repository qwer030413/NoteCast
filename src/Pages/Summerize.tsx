import { useState, useEffect } from "react";
import ChatRoom from "@/components/AIChatBot/ChatRoom";
import ChatInput from "@/components/AIChatBot/ChatInput";
import { RetrieveAndGenerateCommand } from "@aws-sdk/client-bedrock-agent-runtime";
import { useAwsClients } from "@/aws/ClientProvider";
import { v4 as uuidv4 } from "uuid";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import {PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { StartIngestionJobCommand } from "@aws-sdk/client-bedrock-agent";
import { useAuth } from "@/aws/AuthProvider";
type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Summarize() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  // const [sessionId, setSessionId] = useState<string>(uuidv4());
  const [dbFiles, setDbFiles] = useState<any[]>([]); 
  const [selectedFileId, setSelectedFileId] = useState<string>("all");
  const { bedrockAgentRuntime, bedrockAgent, s3Client, dynamoClient } = useAwsClients();
  const { user } = useAuth();
  // Auto-scroll logic using window.scrollTo
  useEffect(() => {
    // console.log('h')
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
        console.log(response.Items)
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
    // Use the file name if no text input is provided
    const userMessageContent = input || (file ? `Analyze ${file.name}` : "Summarize document");
    setMessages((prev) => [...prev, { role: "user", content: userMessageContent }]);
    
    // 1. Capture the input then clear it for UX
    const currentInput = input;
    setInput("");

    try {
        let currentFileId = selectedFileId;

        // 2. Handle New File Upload
        if (file) {
            const fileId = `file-${Date.now()}`;
            const key = `inputs/${file.name}`;
            
            // Upload File
            await s3Client.send(new PutObjectCommand({
                Bucket: 'note-cast-user',
                Key: key,
                Body: file,
            }));

            // Upload Metadata (Must match the casing in your vector store)
            const metadata = {
                metadataAttributes: {
                    file_id: fileId, // Use underscore
                    user_id: user    // Add user filter for security
                }
            };
            await s3Client.send(new PutObjectCommand({
                Bucket: 'note-cast-user',
                Key: `${key}.metadata.json`,
                Body: JSON.stringify(metadata),
            }));

            // Trigger Sync
            await bedrockAgent.send(new StartIngestionJobCommand({
                knowledgeBaseId: 'ZEYGFYPU3S',
                dataSourceId: '10Z5LEVPS5',
            }));

            currentFileId = fileId;
            setFile(null);
            
            // IMPORTANT: Add a small delay or a message to the user
            setMessages(prev => [...prev, { 
                role: "assistant", 
                content: "I've received the file! It's being indexed. This usually takes about 30 seconds..." 
            }]);
            // You might want to return early here or implement polling
        }

        // 3. Build the Filter
        // We want to filter by USER first, then FILE if one is selected
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
    <div className="min-h-screen w-full flex flex-col bg-background text-foreground items-center">
      {/*Main content */}
      <ChatRoom messages={messages} loading={loading}/>

      {/* Input Section*/}
      <ChatInput setFile={setFile} setInput={setInput} file={file} input={input} loading={loading} handleSend={handleSend} dbFiles = {dbFiles} selectedFileId = {selectedFileId} setSelectedFileId = {setSelectedFileId}/>
    </div>
  );
}
