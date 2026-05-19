export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-black">
      {/* Header Skeleton */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/80">
        <div className="h-4 w-16 bg-white/10 rounded-md animate-pulse"></div>
        <div className="h-5 w-32 bg-white/10 rounded-md animate-pulse"></div>
        <div className="flex items-center gap-3">
          <div className="h-4 w-24 bg-white/10 rounded-md animate-pulse"></div>
          <div className="h-7 w-12 bg-white/10 rounded-full animate-pulse"></div>
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="pt-24 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="h-8 w-64 bg-white/10 rounded-lg animate-pulse mb-3"></div>
          <div className="h-4 w-96 bg-white/5 rounded-md animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/5">
              {/* Thumbnail Skeleton */}
              <div className="aspect-video w-full bg-white/5 animate-pulse"></div>
              {/* Content Skeleton */}
              <div className="p-5 space-y-4">
                <div className="space-y-2">
                  <div className="h-5 w-full bg-white/10 rounded-md animate-pulse"></div>
                  <div className="h-5 w-3/4 bg-white/10 rounded-md animate-pulse"></div>
                </div>
                <div className="h-3 w-32 bg-white/5 rounded-md animate-pulse"></div>
                
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <div className="h-9 w-full bg-white/5 rounded-lg animate-pulse"></div>
                  <div className="h-9 w-full bg-white/5 rounded-lg animate-pulse"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
