
import { FileStack, Plus, UploadCloud } from "lucide-react"; // Added icons


export default function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="relative mb-4">
                <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full scale-150" />
                <div className="relative bg-white dark:bg-slate-950 p-4 rounded-2xl border shadow-sm">
                    <FileStack className="size-10 text-slate-400" />
                </div>
            </div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                No files uploaded yet
            </h3>
            <p className="text-sm text-slate-500 mt-1 max-w-[220px] text-center">
                Upload your first document to start generating audio notes.
            </p>
        </div>
    );
}