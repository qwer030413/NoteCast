import * as React from "react"
import { TrendingUp } from "lucide-react"
import { Label, Pie, PieChart } from "recharts"
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
export default function SideChart(props:any){
    const chartConfig = {
        visitors: {
            label: "class work",
        },
        chrome: {
            label: "personal notes",
            color: "var(--chart-1)",
        },
        safari: {
            label: "lecture notes",
            color: "var(--chart-2)",
        },
        firefox: {
            label: "meeting notes",
            color: "var(--chart-3)",
        },
        edge: {
            label: "journal",
            color: "var(--chart-4)",
        },
        other: {
            label: "book summaries",
            color: "var(--chart-5)",
        },
    } satisfies ChartConfig
    const totalVisitors = React.useMemo(() => {
        return props.categoryStats.reduce((acc: any, curr: any) => acc + curr.count, 0)
    }, [props.categoryStats])
    return(
        // <div className="w-[300px] min-w-[250px] bg-muted p-4 rounded-lg shadow">
        <Card className="flex flex-col h-110">
            <CardHeader className="items-center pb-0">
                <CardTitle>Uploaded Notes</CardTitle>
                <CardDescription>January - June 2024</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-0">
                <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[250px]"
                >
                <PieChart>
                    <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                    data={props.categoryStats}
                    dataKey="count"
                    nameKey="category"
                    innerRadius={60}
                    strokeWidth={5}
                    >
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
                                className="fill-foreground text-3xl font-bold"
                                >
                                {totalVisitors.toLocaleString()}
                                </tspan>
                                <tspan
                                x={viewBox.cx}
                                y={(viewBox.cy || 0) + 24}
                                className="fill-muted-foreground"
                                >
                                Files Uploaded
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
            <CardFooter className="flex-col gap-2 text-sm">
                <div className="flex items-center gap-2 leading-none font-medium">
                Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
                </div>
                <div className="text-muted-foreground leading-none">
                Showing total files uploaded for this month
                </div>
            </CardFooter>
        </Card>
    );
}