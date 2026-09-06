export default function PlansLoading() {
  return (
    <div>
      <div className="mb-6 h-8 w-56 animate-pulse rounded bg-white/10" />
      <div className="grid gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-48 animate-pulse rounded-2xl border border-white/10 bg-surface" />
        ))}
      </div>
    </div>
  );
}
