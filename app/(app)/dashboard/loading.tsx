export default function DashboardLoading() {
  return (
    <div>
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-white/10" />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 animate-pulse rounded-2xl border border-white/10 bg-surface" />
        ))}
      </div>
      <div className="h-48 animate-pulse rounded-2xl border border-white/10 bg-surface" />
    </div>
  );
}
