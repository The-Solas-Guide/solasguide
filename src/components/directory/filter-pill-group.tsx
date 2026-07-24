import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type FilterPillGroupProps = {
  items: readonly string[];
  activeItems?: readonly string[];
  label?: string;
  className?: string;
};

export function FilterPillGroup({ items, activeItems = [], label = "Filters", className }: FilterPillGroupProps) {
  return <div aria-label={label} className={cn("flex flex-wrap gap-2", className)}>{items.map((item) => <Badge key={item} variant={activeItems.includes(item) ? "default" : "outline"}>{item}</Badge>)}</div>;
}
