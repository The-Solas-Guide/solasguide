import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <main data-admin className="flex min-h-svh items-center justify-center px-5 py-8">
      <div className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-border/80 bg-card p-6 shadow-sm md:p-8">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-64 max-w-full" />
        <Skeleton className="mt-4 h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </main>
  );
}
