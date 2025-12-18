export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-2",
    lg: "w-12 h-12 border-3",
  }

  return (
    <div className="flex items-center justify-center">
      <div
        className={`${sizeClasses[size]} border-[#00ff41] border-t-transparent rounded-full animate-spin`}
        style={{ animation: "spinner-rotate 0.8s linear infinite" }}
      />
    </div>
  )
}

export function ScanLineLoader() {
  return (
    <div className="relative w-full h-1 bg-[#111618] overflow-hidden rounded-full">
      <div
        className="absolute inset-0 h-full bg-gradient-to-r from-transparent via-[#00ff41] to-transparent"
        style={{ animation: "scan-line 2s linear infinite" }}
      />
    </div>
  )
}

export function PulseLoader() {
  return (
    <div className="flex gap-2 items-center justify-center">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-[#00ff41] rounded-full"
          style={{
            animation: "pulse-glow 1.5s ease-in-out infinite",
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
    </div>
  )
}
