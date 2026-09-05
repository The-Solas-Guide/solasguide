import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPortalLoading() {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-6">
      <div className="grid gap-2 rounded-xl border border-border/80 bg-card p-5 shadow-sm md:p-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm"><Skeleton className="h-16" /></div>
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm"><Skeleton className="h-16" /></div>
        <div className="rounded-xl border border-border/80 bg-card p-5 shadow-sm"><Skeleton className="h-16" /></div>
      </div>
      <div className="overflow-hidden rounded-xl border border-border/80 bg-card shadow-sm">
        <Skeleton className="h-14 w-full rounded-none" />
        <Skeleton className="h-14 w-full rounded-none border-t border-border/70" />
        <Skeleton className="h-14 w-full rounded-none border-t border-border/70" />
      </div>
    </div>
  );
}
