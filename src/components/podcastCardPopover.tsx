import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import DropDownMenu from "@/components/dropdownMenu";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { UpdateItemCommand } from "@aws-sdk/client-dynamodb";

export default function PostcardPopover(props:any) {
  const [category,setCategory] = useState(props.category)
  const [name, setName] = useState(props.podcastName || "")
  const [open, setOpen] = useState(false)
  async function updatePodcast(user: string, name: string, category: string) {
    const command = new UpdateItemCommand({
      TableName: "UserPodcasts", 
      Key: {
        userName: {
          S: user
        },
        podcastId:{
          S:props.podcastId
        }
      },
      UpdateExpression: "SET podcastName = :podcastName, category = :category",
      ExpressionAttributeValues: {
        ":podcastName": {S: name},
        ":category": {S: category},
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
        <BsThreeDotsVertical size = {20} onClick={(e) => e.stopPropagation()} className="cursor-pointer"/>
      </PopoverTrigger>
      <PopoverContent className="w-80"  onClick={(e) => e.stopPropagation()}>
        <div className="grid gap-4">
          <div className="space-y-2">
            <h4 className="leading-none font-medium">Options</h4>
            <p className="text-muted-foreground text-sm">
              Edit this podcast
            </p>
          </div>
          <div className="grid gap-2">
            <div className="grid grid-cols-3 items-center gap-4">
              <Label htmlFor="width">Name</Label>
              <Input
                id="maxWidth"
                value={name}
                className="col-span-2 h-8"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="grid items-center gap-4">
              <Label htmlFor="maxWidth">Category</Label>
              <DropDownMenu value = {category} categories = {categories} setValue = {setCategory} name = {"Select Category..."} search = {"Search Categories.."} notFound = {"No Category Found"} className="col-span-2"/>
            </div>
          </div>
          <Button variant="destructive">Delete Podcast</Button>
          <Button variant="secondary" onClick={() => updatePodcast(props.user, name, category)}>Save Changes</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
