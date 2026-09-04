import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex min-h-7 w-fit items-center justify-center rounded-full border px-2.5 py-1 text-xs font-medium leading-none transition-colors", { variants: { variant: { default: "border-transparent bg-primary text-primary-foreground", secondary: "border-transparent bg-secondary text-secondary-foreground", outline: "border-border bg-transparent text-foreground", destructive: "border-transparent bg-destructive/10 text-destructive" } }, defaultVariants: { variant: "default" } });

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
