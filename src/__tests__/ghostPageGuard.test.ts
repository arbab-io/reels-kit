import { describe, expect, it } from '@jest/globals';
import { clampScrollOffset } from '../utils/ghostPageGuard';

describe('clampScrollOffset', () => {
  it('snaps to the nearest item boundary', () => {
    expect(clampScrollOffset(190, 5, 200)).toBe(200);
    expect(clampScrollOffset(90, 5, 200)).toBe(0);
  });

  it('clamps within [0, (itemCount - 1) * itemHeight]', () => {
    expect(clampScrollOffset(-50, 5, 200)).toBe(0);
    expect(clampScrollOffset(10000, 5, 200)).toBe(800);
  });

  it('returns 0 for degenerate input', () => {
    expect(clampScrollOffset(100, 0, 200)).toBe(0);
    expect(clampScrollOffset(100, 5, 0)).toBe(0);
  });
});
