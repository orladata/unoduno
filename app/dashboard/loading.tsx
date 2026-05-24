export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-black">
      {/* Skeleton Header */}
      <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/80 backdrop-blur-md">
        <div className="w-16 h-4 bg-white/10 rounded animate-pulse" />
        <div className="w-32 h-5 bg-white/10 rounded animate-pulse" />
        <div className="flex items-center gap-3">
          <div className="w-24 h-4 bg-white/10 rounded animate-pulse" />
          <div className="w-12 h-7 bg-white/10 rounded-full animate-pulse" />
        </div>
      </header>

      {/* Skeleton Main Content */}
      <main className="pt-24 pb-20 px-4 sm:px-6 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="w-64 h-8 bg-white/10 rounded-lg animate-pulse mb-3" />
          <div className="w-96 h-4 bg-white/10 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="rounded-2xl overflow-hidden bg-[#0a0a0a] border border-white/5">
              {/* Thumbnail Skeleton */}
              <div className="aspect-video w-full bg-white/5 animate-pulse" />
              
              {/* Content Skeleton */}
              <div className="p-5">
                <div className="w-3/4 h-5 bg-white/10 rounded animate-pulse mb-2" />
                <div className="w-1/2 h-5 bg-white/10 rounded animate-pulse mb-5" />
                
                <div className="w-1/3 h-3 bg-white/10 rounded animate-pulse mb-6" />
                
                <div className="grid grid-cols-2 gap-2">
                  <div className="h-9 bg-white/5 rounded-lg animate-pulse" />
                  <div className="h-9 bg-white/5 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
