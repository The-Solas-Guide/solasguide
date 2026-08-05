import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border text-xs font-semibold uppercase tracking-[0.13em] transition-colors focus-visible:ring-2 focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "border-primary bg-primary px-5 text-primary-foreground hover:bg-primary/82",
        outline:
          "border-border bg-background px-5 text-foreground hover:border-foreground/45 hover:bg-muted",
        secondary:
          "border-secondary bg-secondary px-5 text-secondary-foreground hover:bg-secondary/70",
        ghost:
          "border-transparent px-3 text-foreground hover:bg-muted",
        link:
          "min-h-0 border-transparent p-0 normal-case tracking-normal text-foreground underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11",
        sm: "min-h-9 px-3 text-[0.65rem]",
        lg: "min-h-12 px-7",
        icon: "size-11 min-h-11 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
