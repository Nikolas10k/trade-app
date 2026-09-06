export default function HistoryLoading() {
  return (
    <div>
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-white/10" />
      <div className="mb-4 h-10 w-full max-w-md animate-pulse rounded bg-white/5" />
      <div className="space-y-3">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl border border-white/10 bg-surface" />
        ))}
      </div>
    </div>
  );
}
