import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { fetchAuthSession } from "aws-amplify/auth";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";
import { PollyClient } from "@aws-sdk/client-polly";
import { BedrockAgentRuntimeClient } from "@aws-sdk/client-bedrock-agent-runtime";
import { BedrockAgentClient } from "@aws-sdk/client-bedrock-agent";
import { useAuth } from "./AuthProvider";
type AwsClients = {
  dynamoClient?: DynamoDBClient;
  s3Client?: S3Client;
  pollyClient?: PollyClient;
  loading: boolean;
  bedrockAgentRuntime?: BedrockAgentRuntimeClient;
  bedrockAgent?: BedrockAgentClient;
};

const AwsClientContext = createContext<AwsClients | null>(null);

export function AwsClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [clients, setClients] = useState<AwsClients>({
    loading: true,
  });
  const { user } = useAuth();
  const initClients = useCallback(async () => {
    if (!user) {
      setClients({ loading: false });
      return;
    }
    try {
      setClients((prev) => ({ ...prev, loading: true }));
      const session = await fetchAuthSession();
      const credentials = session.credentials;

      // If no credentials, don't throw an error yet—just wait.
      if (!credentials) {
        setClients({ loading: false });
        return;
      }

      const sharedConfig = {
        region: "us-east-2",
        credentials,
      };

      setClients({
        dynamoClient: new DynamoDBClient(sharedConfig),
        s3Client: new S3Client(sharedConfig),
        pollyClient: new PollyClient({ ...sharedConfig, region: "us-east-1" }),
        bedrockAgentRuntime: new BedrockAgentRuntimeClient(sharedConfig),
        bedrockAgent: new BedrockAgentClient(sharedConfig),
        loading: false,
      });
      console.log("AWS Clients Initialized Successfully");
    } catch (err) {
      console.error("AWS client init failed", err);
      setClients({ loading: false });
    }
  }, [user]);

  useEffect(() => {
    initClients();
  }, [initClients]);

  return (
    <AwsClientContext.Provider value={clients}>
      {children}
    </AwsClientContext.Provider>
  );
}

export function useAwsClients() {
  const context = useContext(AwsClientContext);
  if (!context) {
    throw new Error("useAwsClients must be used within AwsClientProvider");
  }
  return context;
}
