import type { AttributeValue } from "@aws-sdk/client-dynamodb";
import { BarChart3, Clock3, FileText, Headphones, Tags } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCreatedTime, getString } from "@/lib/notecast";

type Item = Record<string, AttributeValue>;

export default function DashboardInsights({ files, podcasts }: { files: Item[]; podcasts: Item[] }) {
  const now = Date.now();
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const uploadsThisWeek = files.filter((item) => getCreatedTime(item) >= weekAgo).length;
  const categories = new Set(files.map((item) => getString(item, "category")).filter(Boolean));
  const latestPodcast = podcasts[0] ? getString(podcasts[0], "podcastName", "Untitled podcast") : "None yet";

  const stats = [
    { label: "Notes", value: files.length, icon: FileText },
    { label: "Podcasts", value: podcasts.length, icon: Headphones },
    { label: "This Week", value: uploadsThisWeek, icon: Clock3 },
    { label: "Categories", value: categories.size, icon: Tags },
  ];

  return (
    <Card className="border-slate-200/60 dark:border-slate-800/60 shadow-sm dark:bg-slate-800/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-bold flex items-center gap-2.5">
          <BarChart3 className="size-5 text-blue-600" />
          Dashboard Insights
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="rounded-lg border bg-background/70 p-4">
                <Icon className="size-4 text-muted-foreground mb-3" />
                <div className="text-2xl font-black">{stat.value}</div>
                <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{stat.label}</div>
              </div>
            );
          })}
        </div>
        <div className="rounded-lg border bg-muted/40 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Latest podcast</p>
          <p className="mt-1 font-medium truncate">{latestPodcast}</p>
        </div>
      </CardContent>
    </Card>
  );
}

