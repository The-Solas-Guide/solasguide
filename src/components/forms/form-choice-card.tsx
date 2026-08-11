import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type FormChoiceCardProps = {
  label: string;
  description?: string;
  selected?: boolean;
  compact?: boolean;
  className?: string;
  value?: string;
  name?: string;
  selectionType?: "radio" | "checkbox";
  onClick?: () => void;
};

export function FormChoiceCard({
  label,
  description,
  selected = false,
  compact = false,
  className,
  value,
  name,
  selectionType,
  onClick,
}: FormChoiceCardProps) {
  const cardClassName = cn(
    "group flex w-full justify-start overflow-hidden rounded-md border text-left transition-colors focus-visible:ring-2 focus-visible:ring-ring/40",
    compact
      ? "min-h-11 flex-row items-center gap-3 px-3 py-2.5"
      : "min-h-[7.5rem] flex-col items-start gap-2 p-4",
    selected
      ? "border-accent bg-accent text-accent-foreground"
      : "border-border bg-background hover:border-foreground/40 hover:bg-card",
    className,
  );
  const indicatorClassName = cn(
    "flex size-5 shrink-0 items-center justify-center border",
    selectionType === "checkbox" ? "rounded-sm" : "rounded-full",
    selected ? "border-accent-foreground" : "border-border",
    "peer-focus-visible:ring-2 peer-focus-visible:ring-ring/40",
  );
  const content = (
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
  );

  if (selectionType) {
    return (
      <label className={cn("relative", cardClassName)}>
        <input
          type={selectionType}
          name={name}
          value={value}
          checked={selected}
          onChange={onClick}
          className="peer absolute inset-0 z-10 cursor-pointer opacity-0"
        />
        <span aria-hidden="true" className={indicatorClassName}>
          {selected && <Check className="size-3" aria-hidden="true" />}
        </span>
        {content}
      </label>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cardClassName}
    >
      <span className={cn("flex size-5 shrink-0 items-center justify-center rounded-full border", selected ? "border-accent-foreground" : "border-border")}>
        {selected && <Check className="size-3" aria-hidden="true" />}
      </span>
      {content}
    </button>
  );
}
