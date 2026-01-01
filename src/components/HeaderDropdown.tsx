import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ArrowUpDown,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils"; // Standard shadcn utility

interface SortableHeaderProps {
  title: string;
  sortKey: string;
  currentSortBy: string;
  currentSortOrder: "asc" | "desc";
  onSort: (sortKey: string, order: "asc" | "desc") => void;
  options?: { asc: string; desc: string };
}

export default function SortableHeader({
  title,
  sortKey,
  currentSortBy,
  currentSortOrder,
  onSort,
}: SortableHeaderProps) {
  const isActive = currentSortBy === sortKey;
  const handleToggleSort = () => {
    if (!isActive) {
      onSort(sortKey, "desc");
    } else {
      onSort(sortKey, currentSortOrder === "asc" ? "desc" : "asc");
    }
  };
  return (
    <button
      onClick={handleToggleSort}
      className={cn(
        "group flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all duration-200 outline-none w-fit",
        isActive
          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm"
          : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
      )}
    >
      <span className={cn(
        "text-[10px] font-black uppercase tracking-widest transition-colors",
        isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200"
      )}>
        {title}
      </span>

      <div className="flex items-center justify-center">
        {isActive ? (
          currentSortOrder === "asc" ? (
            <ArrowUp size={14} className="animate-in fade-in slide-in-from-bottom-1 duration-300" />
          ) : (
            <ArrowDown size={14} className="animate-in fade-in slide-in-from-top-1 duration-300" />
          )
        ) : (
          <ArrowUpDown
            size={12}
            className="text-slate-300 dark:text-slate-600 group-hover:text-slate-400 transition-colors"
          />
        )}
      </div>
    </button>
  );
}