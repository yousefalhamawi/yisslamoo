import { describe, expect, it } from 'vitest';
import { getProductSearchPath } from './productSearch';

describe('getProductSearchPath', () => {
  it('creates a shareable shop search URL from a trimmed query', () => {
    expect(getProductSearchPath('  دوف  ')).toBe('/shop?search=%D8%AF%D9%88%D9%81');
  });

  it('does not search when the query is blank', () => {
    expect(getProductSearchPath('   ')).toBeNull();
  });
});
