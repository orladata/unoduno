export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4">
        {/* Animated Logo/Spinner */}
        <div className="relative">
          <div
            className="w-12 h-12 rounded-2xl animate-pulse"
            style={{ background: "var(--accent-primary)", opacity: 0.2 }}
          />
          <div
            className="absolute inset-0 w-12 h-12 rounded-2xl animate-spin"
            style={{
              border: "2px solid transparent",
              borderTopColor: "var(--accent-primary)",
            }}
          />
        </div>

        <p
          className="text-sm font-medium animate-pulse"
          style={{ color: "var(--text-muted)" }}
        >
          Carregando...
        </p>
      </div>
    </div>
  )
}
