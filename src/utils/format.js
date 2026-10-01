export function formatPValue(v) {
  if (v == null) return '—';
  const n = Number(v);
  if (!Number.isFinite(n)) return '—';
  return n < 0.001 ? '< 0.001' : n.toFixed(3);
}
