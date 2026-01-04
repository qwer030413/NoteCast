import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import DropDownMenu from "@/components/podcastCards/dropdownMenu";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react";
import { UpdateItemCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { FileEdit, MoreVertical, Save, Trash2 } from "lucide-react";

export default function PostcardPopover(props: any) {
  const [category, setCategory] = useState(props.category)
  const [name, setName] = useState(props.podcastName || "")
  const [open, setOpen] = useState(false)
  console.log(props.user)
  async function updatePodcast(user: string, name: string, category: string) {
    if (!name || !category) {
      console.error("Name and category are required");
      return;
    }
    const command = new UpdateItemCommand({
      TableName: "UserPodcasts",
      Key: {
        userName: {
          S: user
        },
        podcastId: {
          S: props.podcastId
        }
      },
      UpdateExpression: "SET podcastName = :podcastName, category = :category",
      ExpressionAttributeValues: {
        ":podcastName": { S: name },
        ":category": { S: category },
      }
    });

    try {
      const response = await props.dynamoClient.send(command);
      props.updatePodcast(props.podcastId, name, category)
      setOpen(false)
      return response;
    } catch (err) {
      console.error("Error updating podcast:", err);
      throw err;
    }
  }

  async function deletePodcast(user: string, podcastId: string, s3Key: string) {
    try {
      const s3Delete = new DeleteObjectCommand({
        Bucket: "note-cast-user",
        Key: s3Key
      });
      await props.s3Client.send(s3Delete);
      console.log("Deleted from S3:", s3Key);
      const dbDelete = new DeleteItemCommand({
        TableName: "UserPodcasts",
        Key: {
          userName: { S: user },
          podcastId: { S: podcastId },
        },
      });
      await props.dynamoClient.send(dbDelete);
      console.log("Deleted from DynamoDB:", podcastId);
      props.deletePodcast(props.podcastId)
      setOpen(false)
      return { success: true };
    } catch (err) {
      console.error("Failed to delete podcast:", err);
      throw err;
    }
  }
  const categories = [
    { value: "Class Work", label: "Class Work" },
    { value: "Personal Notes", label: "Personal Notes" },
    { value: "Lecture Notes", label: "Lecture Notes" },
    { value: "Meeting Notes", label: "Meeting Notes" },
    { value: "Journal", label: "Journal" },
    { value: "Book Summaries", label: "Book Summaries" },
  ];
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={(e) => e.stopPropagation()}
        >
          <MoreVertical size={18} className="text-slate-500" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-80 p-0 overflow-hidden shadow-xl border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
        align="end"
      >
        {/* Header */}
        <div className="bg-slate-50/50 dark:bg-slate-900/50 px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <FileEdit size={16} className="text-blue-500" />
            <h4 className="text-sm font-bold tracking-tight">Podcast Settings</h4>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-4 space-y-4 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="space-y-1.5">
            <Label htmlFor="name" className="text-[11px] uppercase font-bold text-slate-400">
              Display Name
            </Label>
            <Input
              id="name"
              value={name}
              className="h-9 focus-visible:ring-blue-500"
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[11px] uppercase font-bold text-slate-400">
              Category
            </Label>
            <DropDownMenu
              value={category}
              categories={categories}
              setValue={setCategory}
              name="Select Category..."
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-3 bg-slate-50/50 dark:bg-slate-900/50 border-t flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 gap-1.5 h-8 font-semibold"
            onClick={() => deletePodcast(props.user, props.podcastId, props.s3Key)}
          >
            <Trash2 size={14} />
            Delete
          </Button>

          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 h-8 gap-1.5 px-4 font-semibold"
            onClick={() => updatePodcast(props.user, name, category)}
          >
            <Save size={14} />
            Save
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
