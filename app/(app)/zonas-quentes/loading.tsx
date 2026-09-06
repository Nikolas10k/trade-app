export default function HotZonesLoading() {
  return (
    <div>
      <div className="mb-2 h-8 w-48 animate-pulse rounded bg-white/10" />
      <div className="mb-6 h-4 w-96 max-w-full animate-pulse rounded bg-white/5" />
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl border border-white/10 bg-surface" />
        ))}
      </div>
    </div>
  );
}
