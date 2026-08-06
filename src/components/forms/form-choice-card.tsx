import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type FormChoiceCardProps = {
  label: string;
  description?: string;
  selected?: boolean;
  compact?: boolean;
  className?: string;
  onClick?: () => void;
};

export function FormChoiceCard({
  label,
  description,
  selected = false,
  compact = false,
  className,
  onClick,
}: FormChoiceCardProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "group flex w-full justify-start overflow-hidden rounded-md border text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring/40",
        compact
          ? "min-h-11 flex-row items-center gap-3 px-3 py-2.5"
          : "min-h-[7.5rem] flex-col items-start gap-2 p-4",
        selected
          ? "border-accent bg-accent text-accent-foreground"
          : "border-border bg-background hover:border-foreground/40 hover:bg-card",
        className,
      )}
    >
      <span
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-accent-foreground" : "border-border",
        )}
      >
        {selected && <Check className="size-3" aria-hidden="true" />}
      </span>
      <span className="min-w-0">
        <span
          className={cn(
            "block font-display leading-tight text-balance",
            compact ? "text-sm" : "text-lg",
          )}
        >
          {label}
        </span>
        {description && (
          <span
            className={cn(
              "mt-1.5 block text-xs leading-relaxed",
              selected ? "text-accent-foreground/75" : "text-muted-foreground",
            )}
          >
            {description}
          </span>
        )}
      </span>
    </button>
  );
}
