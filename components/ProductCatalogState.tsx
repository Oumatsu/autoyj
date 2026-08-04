import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Loading from "@/components/Loading";

export function ProductCatalogSkeleton() {
  return (
    <div
      className="grid md:grid-cols-2 gap-8 mb-0"
      role="status"
      aria-label="Loading vehicle inventory"
    >
      {Array.from({ length: 4 }, (_, index) => (
        <div
          key={index}
          className="v-card-compact overflow-hidden pointer-events-none rounded-2xl border border-white/10 p-5 bg-[#0c1322]/50"
          aria-hidden="true"
        >
          <Skeleton className="h-48 w-full rounded-xl mb-4" />
          <div className="space-y-4">
            <div className="flex justify-between gap-4">
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="h-6 w-3/4" />
              </div>
              <div className="w-24 space-y-2">
                <Skeleton className="ml-auto h-3 w-12" />
                <Skeleton className="ml-auto h-5 w-20" />
              </div>
            </div>
            <div className="space-y-3 pt-2">
              {Array.from({ length: 3 }, (_, row) => (
                <div key={row} className="flex justify-between border-b border-white/5 pb-2">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-28" />
                </div>
              ))}
            </div>
            <Skeleton className="mt-4 h-3 w-32" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductCatalogUnavailable() {
  return (
    <Alert variant="default" className="min-h-[200px] flex items-center justify-center text-center my-6">
      <AlertDescription className="text-slate-400">
        Vehicle data is temporarily unavailable. Please refresh and try again.
      </AlertDescription>
    </Alert>
  );
}
