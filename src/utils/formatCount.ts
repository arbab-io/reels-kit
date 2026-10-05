export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  if (n < 1_000_000) return `${trimTrailingZero(n / 1000)}K`;
  if (n < 1_000_000_000) return `${trimTrailingZero(n / 1_000_000)}M`;
  return `${trimTrailingZero(n / 1_000_000_000)}B`;
}

function trimTrailingZero(n: number): string {
  return n.toFixed(1).replace(/\.0$/, '');
}
