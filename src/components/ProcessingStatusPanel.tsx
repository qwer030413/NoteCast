import type { AttributeValue } from "@aws-sdk/client-dynamodb";
import { CheckCircle2, CircleDashed, FileText, Headphones, SearchCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getString } from "@/lib/notecast";

type Item = Record<string, AttributeValue>;

function statusTone(status: string) {
  if (status.includes("ready") || status.includes("uploaded") || status.includes("complete")) {
    return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20";
  }
  if (status.includes("indexing") || status.includes("requested")) {
    return "text-amber-600 bg-amber-50 dark:bg-amber-900/20";
  }
  return "text-slate-600 bg-slate-100 dark:bg-slate-800";
}

export default function ProcessingStatusPanel({ files, podcasts }: { files: Item[]; podcasts: Item[] }) {
  const recentFiles = files.slice(0, 5);
  const recentPodcasts = podcasts.slice(0, 5);

  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm dark:bg-slate-800/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold flex items-center gap-2.5">
          <CircleDashed className="size-5 text-amber-600" />
          Processing Status
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 xl:grid-cols-2">
        <StatusList
          title="Documents"
          icon={FileText}
          empty="No documents uploaded yet."
          items={recentFiles.map((item) => ({
            name: getString(item, "fileName", "Untitled note"),
            primary: getString(item, "status", "uploaded"),
            secondary: getString(item, "aiStatus", "not_indexed"),
          }))}
        />
        <StatusList
          title="Podcasts"
          icon={Headphones}
          empty="No podcasts generated yet."
          items={recentPodcasts.map((item) => ({
            name: getString(item, "podcastName", "Untitled podcast"),
            primary: "audio_ready",
            secondary: getString(item, "voice", "voice unknown"),
          }))}
        />
      </CardContent>
    </Card>
  );
}

function StatusList({
  title,
  icon: Icon,
  empty,
  items,
}: {
  title: string;
  icon: typeof FileText;
  empty: string;
  items: { name: string; primary: string; secondary: string }[];
}) {
  return (
    <div className="rounded-lg border bg-background/70 p-4">
      <div className="flex items-center gap-2 text-sm font-bold mb-3">
        <Icon className="size-4 text-muted-foreground" />
        {title}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{empty}</p>
      ) : (
        <div className="space-y-2">
          {items.map((item) => (
            <div key={`${title}-${item.name}-${item.primary}`} className="flex items-center justify-between gap-3 rounded-md border px-3 py-2">
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{item.name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <SearchCheck className="size-3" />
                  {item.secondary.replaceAll("_", " ")}
                </p>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${statusTone(item.primary)}`}>
                <CheckCircle2 className="mr-1 inline size-3" />
                {item.primary.replaceAll("_", " ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

