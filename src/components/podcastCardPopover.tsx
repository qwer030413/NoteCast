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

export default function PostcardPopover(props:any) {
  const [category,setCategpry] = useState(props.category)
  const categories = [
      {
          value: "Class Work",
          label: "Class Work",
      },
      {
          value: "Personal notes",
          label: "Personal Notes",
      },
      {
          value: "Lecture notes",
          label: "Lecture Notes",
      },
      {
          value: "Meeting notes",
          label: "Meeting Notes",
      },
      {
          value: "Journal",
          label: "Journal",
      },
      {
          value: "Book summaries",
          label: "Book Summaries",
      }
  ]
  return (
    <Popover>
      <PopoverTrigger asChild>
        <BsThreeDotsVertical size = {20} onClick={(e) => e.stopPropagation()} className="cursor-pointer"/>
      </PopoverTrigger>
      <PopoverContent className="w-80">
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
                defaultValue={props.podcastName}
                className="col-span-2 h-8"
              />
            </div>
            <div className="grid items-center gap-4">
              <Label htmlFor="maxWidth">Category</Label>
              <DropDownMenu value = {category} categories = {categories} setValue = {setCategpry} name = {"Select Category..."} search = {"Search Categories.."} notFound = {"No Category Found"} className="col-span-2"/>
            </div>
          </div>
          <Button variant="destructive">Delete Podcast</Button>
          <Button variant="secondary">Save Changes</Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
