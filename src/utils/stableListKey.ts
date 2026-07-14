export function getStableListKey(
  primaryIdentity: unknown,
  secondaryIdentity: unknown,
  fallbackPrefix: string,
  index: number,
): string {
  const primary = typeof primaryIdentity === 'string' ? primaryIdentity.trim() : '';
  const secondary = typeof secondaryIdentity === 'string' ? secondaryIdentity.trim() : '';
  if (primary || secondary) {
    return primary || secondary;
  }

  return `${fallbackPrefix}-${index}`;
}
