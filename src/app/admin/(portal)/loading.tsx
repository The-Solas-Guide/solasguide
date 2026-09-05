import { Skeleton } from "@/components/ui/skeleton";

export default function AdminPortalLoading() {
  return (
    <div className="mx-auto flex w-full min-w-0 max-w-7xl flex-col gap-8">
      <div className="grid gap-2 border-b border-border/80 pb-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="grid gap-3 border-b border-border/80 py-5 sm:grid-cols-3">
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
        <Skeleton className="h-16" />
      </div>
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
    </div>
  );
}
