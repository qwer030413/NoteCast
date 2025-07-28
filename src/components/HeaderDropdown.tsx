import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronsUpDown } from "lucide-react";

interface SortableHeaderProps {
  title: string;
  sortKey: string;
  currentSortBy: string;
  currentSortOrder: "asc" | "desc";
  onSort: (sortKey: string, order: "asc" | "desc") => void;
  options?: { asc: string; desc: string }; // Labels for dropdown items
}

export default function SortableHeader({
  title,
  sortKey,
  currentSortBy,
  currentSortOrder,
  onSort,
  options = { asc: "Ascending", desc: "Descending" },
}: SortableHeaderProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex justify-start">
      <div className="inline-flex items-center justify-start gap-1 cursor-pointer text-left px-2 py-2 rounded hover:bg-muted transition">
        {title}
        <ChevronsUpDown size = {15} />
      </div>
        {/* {title} */}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => onSort(sortKey, "asc")}>
          {options.asc}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSort(sortKey, "desc")}>
          {options.desc}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
