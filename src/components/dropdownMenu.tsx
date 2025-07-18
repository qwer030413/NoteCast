
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area"

export default function DropDownMenu(props:any){
    const [open, setOpen] = useState(false)
    return (
        <Popover open={open} onOpenChange={setOpen} modal={true}>
            <PopoverTrigger asChild>
                <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full justify-between"
                >
                {props.value
                    ? props.categories.find((category: { value: any; }) => category.value === props.value)?.label
                    : props.name}
                <ChevronsUpDown className="opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-[100%] p-0">
                <Command>
                <CommandInput placeholder={props.search} className="h-9 w-full" />
                <CommandList>
                    <ScrollArea className="h-72 w-full rounded-md border">
                    <CommandEmpty>{props.notFound}</CommandEmpty>
                    <CommandGroup>
                    {props.categories.map((category:any) => (
                        <CommandItem
                        key={category.value}
                        value={category.value}
                        onSelect={(currentValue) => {
                            props.setValue(currentValue === props.value ? "" : currentValue)
                            setOpen(false)
                        }}
                        >
                        {category.label}
                        <Check
                            className={cn(
                            "ml-auto",
                            props.value === category.value ? "opacity-100" : "opacity-0"
                            )}
                        />
                        </CommandItem>
                    ))}
                    </CommandGroup>
                    </ScrollArea>
                </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}