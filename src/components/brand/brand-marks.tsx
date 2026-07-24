import { cn } from "@/lib/utils";

export type BrandWordmarkProps = {
  reversed?: boolean;
  caption?: string;
  className?: string;
};

export function BrandWordmark({ reversed = false, caption, className }: BrandWordmarkProps) {
  return <div className={cn("flex items-center justify-center p-8 text-center", reversed && "bg-foreground text-background", className)}><div><p className="font-display text-4xl md:text-5xl">The Solas Guide</p>{caption && <p className={cn("mt-4 text-[10px] uppercase tracking-[0.2em]", reversed ? "opacity-60" : "text-muted-foreground")}>{caption}</p>}</div></div>;
}

export type BrandMarkProps = {
  format?: "social" | "square" | "favicon";
  size?: "sm" | "md" | "lg";
  className?: string;
};

const markSizes = { sm: "size-4 text-[7px]", md: "size-8 text-xs", lg: "size-24 text-4xl" };

export function BrandMark({ format = "square", size = "md", className }: BrandMarkProps) {
  return <span aria-label="Provisional mark for The Solas Guide" role="img" className={cn("grid shrink-0 place-items-center bg-foreground font-display text-background", format === "social" && "rounded-full", markSizes[size], className)}>{format === "square" ? "SG" : "S"}</span>;
}
