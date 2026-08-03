import { cn } from "@/lib/utils";

export function BrandWordmark({
  reversed = false,
  caption,
  className,
}: {
  reversed?: boolean;
  caption?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center p-8 text-center",
        reversed && "bg-foreground text-background",
        className,
      )}
    >
      <div>
        <p className="font-display text-4xl leading-none md:text-5xl">
          The Solas Guide
        </p>
        {caption && (
          <p
            className={cn(
              "review-label mt-4",
              reversed ? "opacity-60" : "text-muted-foreground",
            )}
          >
            {caption}
          </p>
        )}
      </div>
    </div>
  );
}
