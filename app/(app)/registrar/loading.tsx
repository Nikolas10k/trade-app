export default function RegisterTradeLoading() {
  return (
    <div>
      <div className="mb-6 h-8 w-56 animate-pulse rounded bg-white/10" />
      <div className="grid gap-6 md:grid-cols-2">
        <div className="h-96 animate-pulse rounded-2xl border border-white/10 bg-surface" />
        <div className="h-96 animate-pulse rounded-2xl border border-white/10 bg-surface" />
      </div>
    </div>
  );
}
