import {useEffect, useState } from "react";

import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
// import FileDialog from "@/components/FileList/fileDialog";
import ViewItemDialog from "@/components/podcastList/viewItemDialog";
import SortableHeader from "@/components/HeaderDropdown";
import CustomPagination from "@/components/Pagination";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useAwsClients } from "@/aws/ClientProvider";
import { useAuth } from "@/aws/AuthProvider";
export default function Podcasts(){
    const { dynamoClient, s3Client, pollyClient, loading } = useAwsClients();
    const { user, userLoading } = useAuth();

    if (loading || userLoading) {
        return (
        <div className="flex-1 justify-center flex items-center">
            <Spinner className="size-10" />
        </div>
        );
    }

    if (!dynamoClient || !s3Client || !pollyClient) {
        return <div>Failed to initialize AWS clients</div>;
    }
    const [podcasts, setPodcasts] = useState<Record<string, AttributeValue>[]>([])
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [searchQuery, setSearchQuery] = useState("");
     const [fetchingFiles, setFetchingFiles] = useState(false);
    const [sortBy, setSortBy] = useState<"fileName" | "category" | "createdAt">(
        "createdAt"
    );
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");


    function simplifyDynamoItem(item: any) {
        return {
            podcastId: item.podcastId?.S,
            userName: item.userName?.S,
            podcastName: item.podcastName?.S,
            createdAt: item.createdAt?.S,
            category: item.category?.S,
            engine: item.engine?.S,
            voice: item.voice.S
        };
    }
    const filteredFiles = podcasts.filter((file) => {
        const name = (file.podcastName as AttributeValue & { S?: string })?.S?.toLowerCase() || "";
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
    const currentFiles = sortedFiles.slice(startIndex, startIndex + itemsPerPage).map(simplifyDynamoItem);

    
    useEffect(() => {
        if (!user || !dynamoClient) return;

        const fetchFiles = async () => {
            try {
                setFetchingFiles(true)
                const command = new QueryCommand({
                    TableName: "UserPodcasts",
                    KeyConditionExpression: "userName = :user",
                    ExpressionAttributeValues: {
                    ":user": { S: user },
                    },
                });

                const response = await dynamoClient.send(command);
                const sortedPodcasts = (response.Items || []).sort((a, b) => {
                    return new Date(b.createdAt?.S || 0).getTime() - new Date(a.createdAt?.S || 0).getTime();
                });
                console.log(sortedPodcasts)

                setPodcasts(sortedPodcasts);
            } 
            catch (err) {
                console.error("Failed to fetch podcasts", err);
            }
            finally{
                setFetchingFiles(false)
            }

        };

        fetchFiles();
    }, [user, dynamoClient]);
    const updateFile = (podcastId: string, newName: string, newCategory: string) => {
        setPodcasts(prev =>
            prev.map(podcast =>
            podcast.podcastId?.S === podcastId
                ? {
                    ...podcast,
                    podcastName: { S: newName },
                    category: { S: newCategory },
                }
                : podcast
            )
        );
    };
    const deleteFile = (podcastId : string) => {
        setPodcasts(prev => prev.filter(podcast => podcast.podcastId?.S !== podcastId));
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
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr_1fr_auto] font-medium text-sm bg-background px-4 py-2 sticky top-0 z-10">
            <SortableHeader
                title="Podcast Name"
                sortKey="podcastname"
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

            <div className="px-2 py-1 flex items-center">Engine</div>
            <div className="px-2 py-1 flex items-center">Voice</div>
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

            {fetchingFiles? (
                <div className="flex items-center justify-center h-64">
                    Fetching files
                    <Spinner className="size-10" />
                </div>
            ): currentFiles.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                No recent uploads
                </div>
            ) : (
                currentFiles.map((file, index) => {
                return (

                    <ViewItemDialog key={index} data={file}  s3Client={s3Client} user={user} dynamoClient = {dynamoClient} updatePodcast = {updateFile} deletePodcast = {deleteFile}/>
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