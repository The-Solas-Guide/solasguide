"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";
import { cn } from "@/lib/utils";

function Command({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="command" role="application" className={cn("flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground", className)} {...props} />;
}

function CommandInput({ className, ...props }: React.ComponentProps<"input">) {
  return <div data-slot="command-input-wrapper" className="flex h-11 items-center gap-2 border-b px-3"><SearchIcon className="size-4 shrink-0 opacity-50" aria-hidden="true" /><input data-slot="command-input" role="combobox" aria-controls="command-list" aria-expanded="true" className={cn("flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50", className)} {...props} /></div>;
}

function CommandList({ className, ...props }: React.ComponentProps<"div">) {
  return <div id="command-list" data-slot="command-list" role="listbox" className={cn("max-h-72 overflow-y-auto overflow-x-hidden p-1", className)} {...props} />;
}

function CommandEmpty({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="command-empty" className={cn("py-6 text-center text-sm text-muted-foreground", className)} {...props} />;
}

function CommandGroup({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="command-group" role="group" className={cn("overflow-hidden p-1 text-foreground [&_[data-slot=command-group-heading]]:px-2 [&_[data-slot=command-group-heading]]:py-1.5 [&_[data-slot=command-group-heading]]:text-xs [&_[data-slot=command-group-heading]]:font-semibold [&_[data-slot=command-group-heading]]:uppercase [&_[data-slot=command-group-heading]]:tracking-[0.1em] [&_[data-slot=command-group-heading]]:text-muted-foreground", className)} {...props} />;
}

function CommandGroupHeading({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="command-group-heading" {...props} className={cn(className)} />;
}

function CommandItem({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="command-item" role="option" aria-selected={false} tabIndex={0} className={cn("flex min-h-11 cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none select-none focus:bg-accent focus:text-accent-foreground", className)} {...props} />;
}

function CommandSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="command-separator" role="separator" className={cn("-mx-1 h-px bg-border", className)} {...props} />;
}

function CommandShortcut({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="command-shortcut" className={cn("ml-auto text-xs tracking-widest text-muted-foreground", className)} {...props} />;
}

export { Command, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandGroupHeading, CommandItem, CommandSeparator, CommandShortcut };
