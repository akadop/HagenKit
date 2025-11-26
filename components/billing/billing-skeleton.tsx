import { Skeleton } from "@/components/ui/skeleton";

export function BillingSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div>
          <Skeleton className="h-9 w-32 mb-2" />
          <Skeleton className="h-5 w-64" />
        </div>
        
        {/* Sandbox banner placeholder */}
        <Skeleton className="h-12 w-full rounded-md" />

        <div className="border-t border-border pt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Plan 1 */}
            <div className="rounded-md border p-4">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-full mb-4" />
              <div className="space-y-2 mt-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="mt-6">
                <Skeleton className="h-10 w-full" />
              </div>
            </div>

            {/* Plan 2 */}
            <div className="rounded-md border p-4">
              <div className="flex items-center justify-between mb-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-16" />
              </div>
              <Skeleton className="h-4 w-full mb-4" />
              <div className="space-y-2 mt-4">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="mt-6">
                <Skeleton className="h-10 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
