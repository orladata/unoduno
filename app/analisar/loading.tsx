export default function AnalisarLoading() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header Skeleton */}
      <header
        className="sticky top-0 z-50 px-4 py-3"
        style={{
          background: "rgba(10,10,12,0.8)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div
            className="h-6 w-24 rounded-lg animate-pulse"
            style={{ background: "rgba(255,255,255,0.1)" }}
          />
          <div
            className="h-9 w-32 rounded-xl animate-pulse"
            style={{ background: "rgba(255,255,255,0.1)" }}
          />
        </div>
      </header>

      {/* Main Content Skeleton */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          {/* Progress Card Skeleton */}
          <div
            className="p-8 rounded-3xl"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            {/* Icon Skeleton */}
            <div className="flex justify-center mb-6">
              <div
                className="w-16 h-16 rounded-2xl animate-pulse"
                style={{ background: "rgba(255,255,255,0.1)" }}
              />
            </div>

            {/* Title Skeleton */}
            <div
              className="h-6 w-48 mx-auto rounded-lg animate-pulse mb-3"
              style={{ background: "rgba(255,255,255,0.1)" }}
            />

            {/* Subtitle Skeleton */}
            <div
              className="h-4 w-64 mx-auto rounded-lg animate-pulse mb-8"
              style={{ background: "rgba(255,255,255,0.06)" }}
            />

            {/* Progress Bar Skeleton */}
            <div
              className="h-2 w-full rounded-full overflow-hidden mb-6"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <div
                className="h-full w-1/3 rounded-full animate-pulse"
                style={{ background: "var(--accent-primary)", opacity: 0.5 }}
              />
            </div>

            {/* Steps Skeleton */}
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: "rgba(255,255,255,0.02)" }}
                >
                  <div
                    className="w-8 h-8 rounded-lg animate-pulse"
                    style={{ background: "rgba(255,255,255,0.08)" }}
                  />
                  <div
                    className="h-4 flex-1 rounded-lg animate-pulse"
                    style={{ background: "rgba(255,255,255,0.06)" }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
