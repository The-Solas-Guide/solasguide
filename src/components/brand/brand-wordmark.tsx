import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandWordmark({
  reversed = false,
  caption,
  className,
  priority = false,
}: {
  reversed?: boolean;
  caption?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-center p-8 text-center",
        reversed && "bg-foreground text-background",
        className,
      )}
    >
      <div className="flex flex-col items-center">
        <Image
          src="/brand/solas-logo-4-pebble.png"
          alt="The Solas Guide"
          width={1600}
          height={606}
          priority={priority}
          className={cn(
            "h-auto w-[220px] md:w-[260px]",
            reversed && "brightness-0 invert",
          )}
        />
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
