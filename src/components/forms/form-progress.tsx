import { cn } from "@/lib/utils";

export type FormProgressProps = { title: string; steps: readonly string[]; currentStep?: number; className?: string };

export function FormProgress({ title, steps, currentStep = 0, className }: FormProgressProps) {
  return <div className={cn("grid gap-8 border border-border p-6 md:grid-cols-[0.55fr_1fr] md:p-9", className)}><div><p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Journey progress</p><p className="mt-4 font-display text-2xl">{title}</p></div><ol className="grid gap-2" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>{steps.map((step, index) => <li key={step} aria-current={index === currentStep ? "step" : undefined} className={cn("border-t-2 border-border pt-3 text-xs text-muted-foreground", index === currentStep && "border-accent text-foreground")}><span className="mr-2 opacity-50">{String(index + 1).padStart(2, "0")}</span>{step}</li>)}</ol></div>;
}
