import {useEffect, useState } from "react";

import {QueryCommand} from "@aws-sdk/client-dynamodb";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import FileDialog from "@/components/FileList/fileDialog";
import SortableHeader from "@/components/HeaderDropdown";
import CustomPagination from "@/components/Pagination";
import { Input } from "@/components/ui/input";
import { useAwsClients } from "@/aws/ClientProvider";
import { useAuth } from "@/aws/AuthProvider";
import { Spinner } from "@/components/ui/spinner";
import { Archive, Inbox, LayoutGrid, Search, Star, Tags } from "lucide-react";
import { motion, type Variants } from "framer-motion";
import { buildLocalTags, getDocumentSearchText, getString } from "@/lib/notecast";
import { Button } from "@/components/ui/button";

const rowVariants: Variants = {
  hidden: { x: -10, opacity: 0 },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 20 }
  }
};

const listVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05, delayChildren: 0.1 }
  }
};
export default function Notes(){
    const { dynamoClient, s3Client, pollyClient, loading } = useAwsClients();
    const { user, userLoading } = useAuth();

    const [files, setFiles] = useState<Record<string, AttributeValue>[]>([])
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState<"fileName" | "category" | "createdAt">(
        "createdAt"
    );
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const [fetchingFiles, setFetchingFiles] = useState(false);
    const [activeTag, setActiveTag] = useState("all");
    const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [archivedIds, setArchivedIds] = useState<string[]>([]);
    const [queuedAudioIds, setQueuedAudioIds] = useState<string[]>([]);
    const storagePrefix = user ? `notecast-${user}` : "notecast-guest";
    useEffect(() => {
        setFavoriteIds(JSON.parse(localStorage.getItem(`${storagePrefix}-favorite-notes`) || "[]"));
        setArchivedIds(JSON.parse(localStorage.getItem(`${storagePrefix}-archived-notes`) || "[]"));
        setQueuedAudioIds(JSON.parse(localStorage.getItem(`${storagePrefix}-queued-audio`) || "[]"));
    }, [storagePrefix]);
    const allTags = Array.from(new Set(files.flatMap(buildLocalTags))).sort();
    const filteredFiles = files.filter((file) => {
        const query = searchQuery.toLowerCase();
        const fileId = getString(file, "fileId");
        const tags = buildLocalTags(file);
        const matchesSearch = getDocumentSearchText(file).includes(query);
        const matchesTag = activeTag === "all" || tags.includes(activeTag);
        const matchesFavorite = !showFavoritesOnly || favoriteIds.includes(fileId);
        const matchesArchive = showArchived ? archivedIds.includes(fileId) : !archivedIds.includes(fileId);
        return matchesSearch && matchesTag && matchesFavorite && matchesArchive;
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
        if (!user || !dynamoClient) return;

        const fetchFiles = async () => {
            try {
                setFetchingFiles(true)
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
            finally{
                setFetchingFiles(false)
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
    const toggleLocalList = (key: string, fileId: string, current: string[], setter: (next: string[]) => void) => {
        const next = current.includes(fileId) ? current.filter((id) => id !== fileId) : [...current, fileId];
        setter(next);
        localStorage.setItem(`${storagePrefix}-${key}`, JSON.stringify(next));
    };
    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) setCurrentPage(page);
    };
    if (loading || userLoading ) {
        return (
        <div className="flex-1 justify-center flex items-center">
            <Spinner className="size-10" />
        </div>
        );
    }

    if (!dynamoClient || !s3Client || !pollyClient) {
        return <div>Failed to initialize AWS clients</div>;
    }
    return (
        <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-6 h-full w-full mx-auto space-y-6" >
        <Card className="mt-8 overflow-hidden border-slate-200/60 dark:border-slate-800/60 shadow-sm transition-all w-full dark:bg-slate-800/30">
        {/* header */}
        <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-black flex items-center gap-3 tracking-tight">
                <div className="p-2 bg-blue-500/10 rounded-xl">
                  <LayoutGrid className="size-6 text-blue-600" />
                </div>
                Your Library
              </CardTitle>
              <p className="text-sm text-slate-500 font-medium">Manage and convert your uploaded documents</p>
            </div>

            <div className="relative group min-w-[300px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Search by name or category..."
                className="pl-10 h-11 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 rounded-xl focus-visible:ring-blue-500 transition-all shadow-sm"
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-500">
                {filteredFiles.length} FILES
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <Button
                type="button"
                variant={showFavoritesOnly ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => setShowFavoritesOnly((value) => !value)}
            >
                <Star className="size-4" />
                Favorites
            </Button>
            <Button
                type="button"
                variant={showArchived ? "default" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => setShowArchived((value) => !value)}
            >
                <Archive className="size-4" />
                Archived
            </Button>
            <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-muted-foreground px-2">
                <Tags className="size-3.5" />
                Tags
            </span>
            <Button type="button" variant={activeTag === "all" ? "default" : "outline"} size="sm" onClick={() => setActiveTag("all")}>
                All
            </Button>
            {allTags.slice(0, 8).map((tag) => (
                <Button key={tag} type="button" variant={activeTag === tag ? "default" : "outline"} size="sm" onClick={() => setActiveTag(tag)}>
                    {tag}
                </Button>
            ))}
          </div>
        </CardHeader>

        {/* content */}
        <CardContent>
            <ScrollArea className="h-full rounded-md border">
            <div className="grid grid-cols-[2.5fr_1.2fr_1.2fr_1fr_auto] px-6 py-4 sticky top-0 z-20 backdrop-blur-md border-b border-slate-100 dark:border-slate-800">

            {/* columns */}
            <SortableHeader
                title="File Name"
                sortKey="fileName"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={(key, order) => {
                setSortBy(key as "fileName" | "category" | "createdAt");
                setSortOrder(order);
                }}
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
            />

            <div className="gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 inline-flex items-center px-2.5 py-0.5">
            Original File
            </div>

            <SortableHeader
                title="Created At"
                sortKey="createdAt"
                currentSortBy={sortBy}
                currentSortOrder={sortOrder}
                onSort={(key, order) => {
                setSortBy(key as "fileName" | "category" | "createdAt");
                setSortOrder(order);
                }}
            />
            </div>

            {fetchingFiles ? (
            <div className="flex items-center justify-center h-64">
                <Spinner className="size-10" />
            </div>
            ) : currentFiles.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-80 text-center space-y-4">
                    <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full">
                      <Inbox className="size-10 text-slate-300" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100">No notes found</h4>
                      <p className="text-sm text-slate-500">Try adjusting your search or upload a new file.</p>
                    </div>
                </div>
            ) : (
                <motion.div
                    key="list"
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                >
                {currentFiles.map((file, index) => {
                const category = (file.category as AttributeValue & { S?: string })?.S || "Uncategorized";
                return (
                    <motion.div 
                    key={file.fileId?.S || index} 
                    variants={rowVariants}
                    className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-900/30"
                    >
                        <FileDialog
                            dynamoClient={dynamoClient}
                            fileId={file.fileId}
                            category={category}
                            fileNameActual={file.fileNameActual}
                            storageKey={file.storageKey}
                            fileType={file.fileType}
                            sourceSize={file.sourceSize}
                            createdAt={file.createdAt}
                            index={index}
                            fileName={file.fileName}
                            key={(file.fileId as AttributeValue & { S?: string })?.S}
                            s3Client={s3Client}
                            user={user}
                            deleteFile={deleteFile}
                            updateFile={updateFile}
                            isFavorite={favoriteIds.includes(getString(file, "fileId"))}
                            isArchived={archivedIds.includes(getString(file, "fileId"))}
                            isQueuedForAudio={queuedAudioIds.includes(getString(file, "fileId"))}
                            onToggleFavorite={() => toggleLocalList("favorite-notes", getString(file, "fileId"), favoriteIds, setFavoriteIds)}
                            onToggleArchive={() => toggleLocalList("archived-notes", getString(file, "fileId"), archivedIds, setArchivedIds)}
                            onToggleAudioQueue={() => toggleLocalList("queued-audio", getString(file, "fileId"), queuedAudioIds, setQueuedAudioIds)}
                        />
                    </motion.div>
                );
                })}
                </motion.div>
            )}
            </ScrollArea>
            <div className="mt-6">
                <CustomPagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    goToPage={goToPage}
                />
            </div>
        </CardContent>
        </Card>
        </motion.div>
    );
}
