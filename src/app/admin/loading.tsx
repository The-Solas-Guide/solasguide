import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLoading() {
  return (
    <main className="flex min-h-svh">
      <Skeleton className="hidden w-64 rounded-none md:block" />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="min-h-[28rem] w-full" />
      </div>
    </main>
  );
}
