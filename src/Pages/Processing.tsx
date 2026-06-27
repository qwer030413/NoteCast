import { useEffect, useState } from "react";
import { QueryCommand, type AttributeValue } from "@aws-sdk/client-dynamodb";
import ProcessingStatusPanel from "@/components/ProcessingStatusPanel";
import { Spinner } from "@/components/ui/spinner";
import { useAwsClients } from "@/aws/ClientProvider";
import { useAuth } from "@/aws/AuthProvider";

export default function Processing() {
  const { dynamoClient, loading } = useAwsClients();
  const { user, userLoading } = useAuth();
  const [files, setFiles] = useState<Record<string, AttributeValue>[]>([]);
  const [podcasts, setPodcasts] = useState<Record<string, AttributeValue>[]>([]);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!user || !dynamoClient) return;

    const fetchStatus = async () => {
      setFetching(true);
      try {
        const expression = {
          KeyConditionExpression: "userName = :user",
          ExpressionAttributeValues: { ":user": { S: user } },
        };
        const [fileResponse, podcastResponse] = await Promise.all([
          dynamoClient.send(new QueryCommand({ TableName: "UserFiles", ...expression })),
          dynamoClient.send(new QueryCommand({ TableName: "UserPodcasts", ...expression })),
        ]);
        const sortByCreatedAt = (items: Record<string, AttributeValue>[]) =>
          items.sort((a, b) => new Date(b.createdAt?.S || 0).getTime() - new Date(a.createdAt?.S || 0).getTime());
        setFiles(sortByCreatedAt(fileResponse.Items || []));
        setPodcasts(sortByCreatedAt(podcastResponse.Items || []));
      } catch (error) {
        console.error("Failed to fetch processing status", error);
      } finally {
        setFetching(false);
      }
    };

    fetchStatus();
  }, [user, dynamoClient]);

  if (loading || userLoading || fetching) {
    return (
      <div className="flex-1 justify-center flex items-center">
        <Spinner className="size-10" />
      </div>
    );
  }

  return (
    <div className="p-6 w-full">
      <ProcessingStatusPanel files={files} podcasts={podcasts} />
    </div>
  );
}

