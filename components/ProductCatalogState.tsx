export function ProductCatalogSkeleton() {
  return (
    <div
      className="grid md:grid-cols-2 gap-8 mb-0"
      role="status"
      aria-label="Loading vehicle inventory"
    >
      {Array.from({ length: 6 }, (_, index) => (
        <div
          key={index}
          className="v-card-compact overflow-hidden pointer-events-none"
          aria-hidden="true"
        >
          <div className="v-card-compact-img-wrap animate-pulse bg-white/[0.06]" />
          <div className="v-card-compact-content animate-pulse">
            <div className="flex justify-between gap-8 mb-8">
              <div className="flex-1 space-y-3">
                <div className="h-2 w-16 rounded-full bg-white/10" />
                <div className="h-6 w-3/4 rounded bg-white/10" />
              </div>
              <div className="w-28 space-y-3">
                <div className="ml-auto h-2 w-16 rounded-full bg-white/10" />
                <div className="ml-auto h-5 w-24 rounded bg-white/10" />
              </div>
            </div>
            <div className="space-y-4">
              {Array.from({ length: 3 }, (_, row) => (
                <div key={row} className="flex justify-between border-b border-white/[0.03] pb-3">
                  <div className="h-2 w-20 rounded-full bg-white/[0.08]" />
                  <div className="h-3 w-28 rounded-full bg-white/10" />
                </div>
              ))}
            </div>
            <div className="mt-7 h-2 w-28 rounded-full bg-white/[0.08]" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProductCatalogUnavailable() {
  return (
    <div
      className="flex min-h-[360px] items-center justify-center rounded-2xl border border-white/[0.06] bg-black/20 px-6 text-center"
      role="alert"
    >
      <p className="text-sm font-light text-gray-500">
        Vehicle data is temporarily unavailable. Please refresh and try again.
      </p>
    </div>
  );
}
