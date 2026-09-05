import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <main className="flex min-h-svh items-center justify-center px-5 py-10">
      <div className="flex w-full max-w-md flex-col gap-4">
        <Skeleton className="h-8 w-36" />
        <Skeleton className="h-4 w-64 max-w-full" />
        <Skeleton className="mt-4 h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>
    </main>
  );
}
