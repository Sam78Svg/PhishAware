export default function RouteFallback() {
  return (
    <div className="route-fallback" role="status" aria-live="polite" aria-label="Loading page">
      <div className="route-fallback-spinner" />
      <span className="visually-hidden">Loading…</span>
    </div>
  );
}
