import { useEffect, useState } from "react";
import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { useAwsClients } from "@/aws/ClientProvider";
import { useAuth } from "@/aws/AuthProvider";
import { Spinner } from "@/components/ui/spinner";
import SideChart from "@/components/sideChart";
import RecentPodcasts from "@/components/podcastCards/recentPodcasts";
import RecentFiles from "@/components/FileList/recentFiles";
import UploadButton from "@/components/Upload Button/UploadButton";



export default function Home() {
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

    // const navigate = useNavigate()
    const [files, setFiles] = useState<Record<string, AttributeValue>[]>([])
    const [podcasts, setPodcasts] = useState<Record<string, AttributeValue>[]>([])
    const [uploadTrigger, setUploadTrigger] = useState(0);
    const [loadingPodcasts, setLoadingPodcasts] = useState(true);
    const [categoryStats, setCategoryStats] = useState<
        { category: string; count: number; fill: string }[]
    >([]);
    const refreshData = () => setUploadTrigger(prev => prev + 1);
    useEffect(() => {
        if (!user) {
            setLoadingPodcasts(false);
            return;
        }

        const fetchFiles = async () => {
            try {
                setLoadingPodcasts(true);
                const command = new QueryCommand({
                    TableName: "UserFiles",
                    KeyConditionExpression: "userName = :user",
                    ExpressionAttributeValues: {
                        ":user": { S: user },
                    },
                });
                const podcastCommand = new QueryCommand({
                    TableName: "UserPodcasts",
                    KeyConditionExpression: "userName = :user",
                    ExpressionAttributeValues: {
                        ":user": { S: user },
                    },
                });
                const podcastResponse = await dynamoClient.send(podcastCommand);
                const response = await dynamoClient.send(command);
                const sortedFiles = (response.Items || []).sort((a, b) => {
                    return new Date(b.createdAt?.S || 0).getTime() - new Date(a.createdAt?.S || 0).getTime();
                });

                const sortedPodcasts = (podcastResponse.Items || []).sort((a, b) => {
                    return new Date(b.createdAt?.S || 0).getTime() - new Date(a.createdAt?.S || 0).getTime();
                });
                setFiles(sortedFiles);
                setPodcasts(sortedPodcasts)
            }
            catch (err) {
                console.error("Failed to fetch files", err);
            }
            finally {
                setLoadingPodcasts(false);
            }
        };

        fetchFiles();
    }, [user, dynamoClient, uploadTrigger]);


    useEffect(() => {
        const transformData = () => {
            if (!files) return;

            const blueShades = [
                "#60a5fa", // blue-400
                "#3b82f6", // blue-500
                "#2563eb", // blue-600
                "#1d4ed8", // blue-700
                "#1e40af", // blue-800
                "#1e3a8a", // blue-900
            ];

            const categoryCountsMap = new Map<string, number>();

            files.forEach((item) => {
                const category = item.category?.S ?? "Uncategorized";
                categoryCountsMap.set(category, (categoryCountsMap.get(category) ?? 0) + 1);
            });

            const transformed = Array.from(categoryCountsMap.entries()).map(
                ([category, count], index) => ({
                    category,
                    count,
                    fill: blueShades[index],
                })
            );

            setCategoryStats(transformed);
        };

        transformData();
    }, [files]);

    const updatePodcast = (podcastId: string, newName: string, newCategory: string) => {
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
    const deletePodcast = (podcastId: string) => {
        setPodcasts(prev => prev.filter(podcast => podcast.podcastId?.S !== podcastId));
    }
    const deleteFile = (fileId: string) => {
        setFiles(prev => prev.filter(file => file.fileId?.S !== fileId));
    }
    return (
        <div className="flex w-full h-full overflow-x-hidden gap-4">
            <div className="flex-1 p-10 overflow-auto">
                <div className="flex justify-between items-center align-center">
                    <h1 className="text-lg font-bold">Recent Podcasts</h1>
                    <UploadButton onUploadSuccess={refreshData} />
                </div>
                <RecentPodcasts podcasts={podcasts} user={user} s3Client={s3Client} dynamoClient={dynamoClient} updatePodcast={updatePodcast} deletePodcast={deletePodcast} loading={loadingPodcasts} />
                <div className="flex justify-between items-start align-center w-[100%] flex-col">
                    <RecentFiles files={files} user={user} s3Client={s3Client} deleteFile={deleteFile} updateFile={updateFile} dynamoClient={dynamoClient} />
                </div>

            </div>
            <SideChart categoryStats={categoryStats} />
        </div>
    );
}
