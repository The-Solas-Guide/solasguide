import Image from "next/image";
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
        <div className="flex items-center justify-center gap-3">
          <Image
            src="/brand/solas-mark-pebble.png"
            alt=""
            width={44}
            height={42}
            className={cn(
              "h-10 w-11 shrink-0 object-contain",
              reversed && "brightness-0 invert",
            )}
          />
          <p className="font-display text-4xl leading-none md:text-5xl">
            The Solas Guide
          </p>
        </div>
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
