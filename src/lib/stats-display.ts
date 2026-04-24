/**
 * Number formatting for the public landing stats block. Kept in a small module
 * with no server-only deps so client dashboard components can import it.
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
