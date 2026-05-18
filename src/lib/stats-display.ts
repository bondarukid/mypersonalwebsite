/**
 * Number formatting for the public landing stats block (no server-only deps).
 */
export function formatActiveUsers(n: number): string {
  if (n >= 1_000_000) {
    return `${(n / 1e6).toFixed(1)} Million`
  }
  if (n >= 1_000) {
    return `${(n / 1_000).toFixed(1)}K`
  }
  return new Intl.NumberFormat().format(n)
}
