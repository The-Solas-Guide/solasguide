"use client";

import * as React from "react";
import { Form as FormPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

function Form({ className, ...props }: React.ComponentProps<typeof FormPrimitive.Root>) {
  return <FormPrimitive.Root data-slot="form" className={cn("space-y-6", className)} {...props} />;
}

function FormField({ className, ...props }: React.ComponentProps<typeof FormPrimitive.Field>) {
  return <FormPrimitive.Field data-slot="form-field" className={cn("space-y-2", className)} {...props} />;
}

function FormLabel({ className, ...props }: React.ComponentProps<typeof FormPrimitive.Label>) {
  return <FormPrimitive.Label data-slot="form-label" className={cn("text-sm font-medium", className)} {...props} />;
}

function FormControl({ ...props }: React.ComponentProps<typeof FormPrimitive.Control>) {
  return <FormPrimitive.Control data-slot="form-control" {...props} />;
}

function FormMessage({ className, ...props }: React.ComponentProps<typeof FormPrimitive.Message>) {
  return <FormPrimitive.Message data-slot="form-message" className={cn("text-sm text-destructive", className)} {...props} />;
}

function FormSubmit({ className, ...props }: React.ComponentProps<typeof FormPrimitive.Submit>) {
  return <FormPrimitive.Submit data-slot="form-submit" className={cn(className)} {...props} />;
}

export { Form, FormField, FormLabel, FormControl, FormMessage, FormSubmit };
