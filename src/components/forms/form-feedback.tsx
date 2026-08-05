import { cn } from "@/lib/utils";

export type FormFeedbackProps = { tone: "error" | "success"; title: string; description: string; className?: string };

export function FormFeedback({ tone, title, description, className }: FormFeedbackProps) {
  return <div role={tone === "error" ? "alert" : "status"} className={cn("border p-6", tone === "error" ? "border-destructive/40 bg-destructive/5" : "border-accent/40 bg-accent/5", className)}><p className={cn(tone === "error" ? "text-xs font-medium text-destructive" : "font-display text-xl")}>{title}</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">{description}</p></div>;
}
