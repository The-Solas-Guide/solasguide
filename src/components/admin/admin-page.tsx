import Link from "next/link";
import { cn } from "@/lib/utils";

export function AdminPage({
  children,
  className,
  width = "wide",
}: {
  children: React.ReactNode;
  className?: string;
  width?: "wide" | "form";
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full min-w-0 flex-col gap-8",
        width === "wide" ? "max-w-7xl" : "max-w-4xl",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function AdminPageHeader({
  title,
  description,
  actions,
  aside,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <header className="flex min-w-0 flex-col gap-4 border-b border-border/80 pb-6 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 max-w-2xl">
        <h1 className="admin-title break-words text-foreground">{title}</h1>
        {description ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {actions || aside ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {aside}
          {actions}
        </div>
      ) : null}
    </header>
  );
}

export function AdminMetricRow({
  items,
}: {
  items: readonly {
    label: string;
    value: React.ReactNode;
    hint?: React.ReactNode;
  }[];
}) {
  return (
    <dl className="grid gap-6 border-b border-border/80 py-5 sm:grid-cols-3">
      {items.map((item) => (
        <div key={item.label} className="min-w-0">
          <dt className="text-sm text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 font-display text-[1.65rem] font-thin tracking-tight text-foreground">
            {item.value}
          </dd>
          {item.hint ? (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {item.hint}
            </p>
          ) : null}
        </div>
      ))}
    </dl>
  );
}

const statusTone: Record<string, string> = {
  published: "bg-accent",
  active: "bg-accent",
  new: "bg-accent",
  contacted: "bg-accent",
  reviewing: "bg-accent",
  accepted: "bg-accent",
  draft: "bg-muted-foreground/45",
  inactive: "bg-muted-foreground/45",
  closed: "bg-muted-foreground/45",
  declined: "bg-muted-foreground/45",
  archived: "bg-muted-foreground/30",
};

export function formatAdminStatus(value: string) {
  return value.replaceAll("_", " ").replace(/^\w/, (letter) => letter.toUpperCase());
}

export function AdminStatus({
  value,
  label,
  className,
}: {
  value: string;
  label?: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 text-sm", className)}
      data-lifecycle={value}
    >
      <span
        aria-hidden="true"
        className={cn(
          "size-1.5 shrink-0 rounded-full",
          statusTone[value] ?? "bg-muted-foreground/45",
        )}
      />
      <span>{label ?? formatAdminStatus(value)}</span>
    </span>
  );
}

export function AdminBackLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="inline-flex min-h-11 items-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
    >
      {children}
    </Link>
  );
}

export function AdminPanel({
  title,
  description,
  children,
  className,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("grid gap-5 border-b border-border/80 pb-8 last:border-b-0", className)}>
      {title ? (
        <div className="max-w-2xl">
          <h2 className="text-sm font-medium">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
