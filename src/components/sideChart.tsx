import * as React from "react"
import { FileText, Tags } from "lucide-react"
import { Label, Pie, PieChart, Cell } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Define colors that match your PodcastCard category branding
const chartConfig = {
  count: {
    label: "Files",
    color: "var(--chart-1)",
  },
  "Class Work": {
    label: "Class Work",
    color: "var(--chart-1)", // Blue
  },
  "Personal Notes": {
    label: "Personal Notes",
    color: "var(--chart-2)", // Green
  },
  "Lecture Notes": {
    label: "Lecture Notes",
    color: "var(--chart-3)", // Amber
  },
  "Meeting Notes": {
    label: "Meeting Notes",
    color: "var(--chart-4)", // Indigo
  },
  "Journal": {
    label: "Journal",
    color: "var(--chart-5)", // Rose
  },
  "Book Summaries": {
    label: "Book Summaries",
    color: "var(--chart-2)", // Cyan
  },
} satisfies ChartConfig

export default function SideChart({ categoryStats = [] }: { categoryStats: any[] }) {
  const totalFiles = React.useMemo(() => {
    return categoryStats.reduce((acc, curr) => acc + curr.count, 0)
  }, [categoryStats])
  const topCategory = React.useMemo(() => {
    return [...categoryStats].sort((a, b) => b.count - a.count)[0]
  }, [categoryStats])

  return (
    <Card className="flex flex-col border-none shadow-md dark:bg-slate-900/50 h-130">
      <CardHeader className="items-center pb-2">
        <CardTitle className="text-xl flex items-center gap-2">
          <FileText className="w-5 h-5 text-blue-500" />
          Note Distribution
        </CardTitle>
        <CardDescription>Activity Overview</CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[280px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={categoryStats}
              dataKey="count"
              nameKey="category"
              innerRadius={70}
              outerRadius={90}
              paddingAngle={5}
              strokeWidth={0}
            >
              {categoryStats.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={chartConfig[entry.category as keyof typeof chartConfig]?.color || "var(--chart-5)"} 
                  className="hover:opacity-80 transition-opacity outline-none"
                />
              ))}
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-4xl font-extrabold"
                        >
                          {totalFiles.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground text-xs font-medium uppercase tracking-widest"
                        >
                          Total Notes
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>

      <CardFooter className="flex-col gap-4 text-sm pt-4">
        <div className="flex flex-wrap justify-center gap-3">
            {categoryStats.map((item) => (
                <div key={item.category} className="flex items-center gap-1.5">
                    <div 
                        className="w-2.5 h-2.5 rounded-full" 
                        style={{ backgroundColor: chartConfig[item.category as keyof typeof chartConfig]?.color }} 
                    />
                    <span className="text-[11px] text-muted-foreground font-medium">{item.category}</span>
                </div>
            ))}
        </div>
        
        <div className="flex items-center gap-2 leading-none font-semibold text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-full">
          <Tags className="h-4 w-4" />
          {topCategory ? `${topCategory.category}: ${topCategory.count}` : "No categories yet"}
        </div>
      </CardFooter>
    </Card>
  )
}
