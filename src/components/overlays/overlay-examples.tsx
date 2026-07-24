"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function EnquiryDialogExample() {
  return <Dialog><DialogTrigger asChild><Button>Open enquiry dialog</Button></DialogTrigger><DialogContent className="rounded-none p-6 sm:max-w-lg"><DialogHeader><DialogTitle className="font-display text-3xl">Begin an enquiry</DialogTitle><DialogDescription>Share a little context first. The full journey continues through the multi-step enquiry form.</DialogDescription></DialogHeader><div className="grid gap-3 py-4 text-sm"><button className="min-h-14 border border-border px-4 text-left">I am looking for a practitioner</button><button className="min-h-14 border border-border px-4 text-left">I am planning a venue or event</button></div><DialogFooter className="rounded-none"><Button>Continue</Button></DialogFooter></DialogContent></Dialog>;
}

export function MobileFilterSheetExample() {
  return <Sheet><SheetTrigger asChild><Button variant="outline"><SlidersHorizontal />Open filter sheet</Button></SheetTrigger><SheetContent className="bg-background"><SheetHeader className="border-b border-border p-6"><SheetTitle className="font-display text-3xl">Refine the guide</SheetTitle><SheetDescription>Choose only what meaningfully narrows the result.</SheetDescription></SheetHeader><div className="grid gap-6 p-6"><label className="grid gap-2 text-sm">Location<select className="h-11 border border-input bg-background px-3"><option>All locations</option><option>Bali</option><option>London</option></select></label><fieldset><legend className="mb-3 text-sm">Type</legend><div className="grid gap-2"><label><input type="checkbox" className="mr-2" />Practitioners</label><label><input type="checkbox" className="mr-2" />Venues</label><label><input type="checkbox" className="mr-2" />Events & Workshops</label></div></fieldset></div><SheetFooter className="border-t border-border"><Button>Show 18 results</Button><Button variant="ghost">Clear all</Button></SheetFooter></SheetContent></Sheet>;
}
