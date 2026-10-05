import { describe, expect, it } from '@jest/globals';
import { formatCount } from '../utils/formatCount';

describe('formatCount', () => {
  it('returns raw numbers under 1000', () => {
    expect(formatCount(0)).toBe('0');
    expect(formatCount(999)).toBe('999');
  });

  it('abbreviates thousands', () => {
    expect(formatCount(1000)).toBe('1K');
    expect(formatCount(1200)).toBe('1.2K');
    expect(formatCount(999999)).toBe('1000K');
  });

  it('abbreviates millions', () => {
    expect(formatCount(1000000)).toBe('1M');
    expect(formatCount(3400000)).toBe('3.4M');
  });

  it('abbreviates billions', () => {
    expect(formatCount(1000000000)).toBe('1B');
  });
});
