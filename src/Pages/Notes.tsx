import {useEffect, useState } from "react";
import { getCurrentUser } from '@aws-amplify/auth'

import { DynamoDBClient, QueryCommand } from "@aws-sdk/client-dynamodb";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { fetchAuthSession } from '@aws-amplify/auth';
import { ScrollArea } from "@/components/ui/scroll-area";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import FileDialog from "@/components/FileList/fileDialog";
import SortableHeader from "@/components/HeaderDropdown";
import CustomPagination from "@/components/Pagination";
import { Input } from "@/components/ui/input";
export default function Notes(){
    const [dynamoClient, setDynamoClient] = useState<DynamoDBClient | null>(null);
    const [s3Client, setS3Client] = useState<S3Client | null>(null);
    const [user, setUser] = useState("")
    const [files, setFiles] = useState<Record<string, AttributeValue>[]>([])
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"fileName" | "category" | "createdAt">(
        "createdAt"
    );
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

    const filteredFiles = files.filter((file) => {
        const name = (file.fileName as AttributeValue & { S?: string })?.S?.toLowerCase() || "";
        const category = (file.category as AttributeValue & { S?: string })?.S?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();
        return name.includes(query) || category.includes(query);
    });
    const sortedFiles = [...filteredFiles].sort((a, b) => {
        const valA =
        (a[sortBy] as AttributeValue & { S?: string })?.S?.toLowerCase() || "";
        const valB =
        (b[sortBy] as AttributeValue & { S?: string })?.S?.toLowerCase() || "";

        if (sortBy === "createdAt") {
        return sortOrder === "asc"
            ? new Date(valA).getTime() - new Date(valB).getTime()
            : new Date(valB).getTime() - new Date(valA).getTime();
        }

        return sortOrder === "asc"
        ? valA.localeCompare(valB)
        : valB.localeCompare(valA);
    });
    const totalPages = Math.ceil(sortedFiles.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentFiles = sortedFiles.slice(startIndex, startIndex + itemsPerPage);
    useEffect(() => {
        const setUpClient = async () => {
            try {
                const session = await fetchAuthSession();
                const credentials = session.credentials;
    
                if (!credentials) {
                throw new Error("No credentials found");
                }
    
                const client = new DynamoDBClient({
                region: 'us-east-2',
                credentials: {
                    accessKeyId: credentials.accessKeyId,
                    secretAccessKey: credentials.secretAccessKey,
                    sessionToken: credentials.sessionToken,
                },
                });
                const s3Client = new S3Client({
                    region: 'us-east-2',
                    credentials: {
                    accessKeyId: credentials.accessKeyId,
                    secretAccessKey: credentials.secretAccessKey,
                    sessionToken: credentials.sessionToken,
                    },
                })
                setDynamoClient(client);
                setS3Client(s3Client)
                getCurrentUser()
                .then((user) => {
                    setUser(user.username)
                })
                .catch(() => console.log("Not signed in"))
            } catch (err) {
                console.error("Failed to configure DynamoDB client:", err);
            }
        };
    
        setUpClient();
    }, []);
    useEffect(() => {
        if (!user || !dynamoClient) return;

        const fetchFiles = async () => {
            try {
                const command = new QueryCommand({
                    TableName: "UserFiles",
                    KeyConditionExpression: "userName = :user",
                    ExpressionAttributeValues: {
                    ":user": { S: user },
                    },
                });

                const response = await dynamoClient.send(command);
                const sortedFiles = (response.Items || []).sort((a, b) => {
                    return new Date(b.createdAt?.S || 0).getTime() - new Date(a.createdAt?.S || 0).getTime();
                });


                setFiles(sortedFiles);
            } 
            catch (err) {
                console.error("Failed to fetch files", err);
            }

        };

        fetchFiles();
    }, [user, dynamoClient]);
    const updateFile = (fileId: string, newName: string, newCategory: string) => {
        setFiles(prev =>
            prev.map(file =>
            file.fileId?.S === fileId
                ? {
                    ...file,
                    fileName: { S: newName },
                    category: { S: newCategory },
                }
                : file
            )
        );
    };
    const deleteFile = (fileId : string) => {
        setFiles(prev => prev.filter(file => file.fileId?.S !== fileId));
    }
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };
    return (
        <div className="flex w-full h-full">
        <Card className="mt-6 w-full h-[100%] bg-background">
        <CardHeader>
            <CardTitle className="text-lg font-bold">Recent File Uploads</CardTitle>
            <Input
                placeholder="Search notes..."
                className="w-sm mt-4 p-3"
                value={searchQuery}
                onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // reset to first page on search
                }}
            />

        </CardHeader>
        <CardContent>
            <ScrollArea className="h-full rounded-md border">
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_auto] font-medium text-sm bg-background px-4 py-2 sticky top-0 z-10">
            <SortableHeader
                title="File Name"
                sortKey="fileName"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={(key, order) => {
                setSortBy(key as "fileName" | "category" | "createdAt");
                setSortOrder(order);
                }}
                options={{ asc: "Sort A → Z", desc: "Sort Z → A" }}
            />

            <SortableHeader
                title="Category"
                sortKey="category"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={(key, order) => {
                setSortBy(key as "fileName" | "category" | "createdAt");
                setSortOrder(order);
                }}
                options={{ asc: "Sort A → Z", desc: "Sort Z → A" }}
            />

            <div className="px-2 py-1 flex items-center">Origin File</div>

            <SortableHeader
                title="Created At"
                sortKey="createdAt"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={(key, order) => {
                setSortBy(key as "fileName" | "category" | "createdAt");
                setSortOrder(order);
                }}
                options={{ asc: "Oldest First", desc: "Newest First" }}
            />
            </div>

            {currentFiles.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                No recent uploads
                </div>
            ) : (
                currentFiles.map((file, index) => {
                const category = (file.category as AttributeValue & { S?: string })?.S || "Uncategorized";
                return (
                    <FileDialog
                        dynamoClient={dynamoClient}
                        fileId={file.fileId}
                        category={category}
                        fileNameActual={file.fileNameActual}
                        createdAt={file.createdAt}
                        index={index}
                        fileName={file.fileName}
                        key={(file.fileId as AttributeValue & { S?: string })?.S}
                        s3Client={s3Client}
                        user={user}
                        deleteFile={deleteFile}
                        updateFile={updateFile}
                    />
                );
                })
            )}
            </ScrollArea>
            <CustomPagination
                totalPages={totalPages}
                currentPage={currentPage}
                goToPage={goToPage}
            />
        </CardContent>
        </Card>
        </div>
    );
}