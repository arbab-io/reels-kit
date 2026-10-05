import { describe, expect, it } from '@jest/globals';
import { fractionFromX, mirrorX } from '../utils/rtl';

describe('mirrorX', () => {
  it('passes dx through unchanged for LTR', () => {
    expect(mirrorX(10, false)).toBe(10);
    expect(mirrorX(-10, false)).toBe(-10);
  });

  it('inverts dx for RTL', () => {
    expect(mirrorX(10, true)).toBe(-10);
    expect(mirrorX(-10, true)).toBe(10);
  });
});

describe('fractionFromX', () => {
  it('maps x to a fraction of the track in LTR', () => {
    expect(fractionFromX(0, 200, false)).toBe(0);
    expect(fractionFromX(50, 200, false)).toBe(0.25);
    expect(fractionFromX(200, 200, false)).toBe(1);
  });

  it('measures from the right edge in RTL', () => {
    expect(fractionFromX(0, 200, true)).toBe(1);
    expect(fractionFromX(50, 200, true)).toBe(0.75);
    expect(fractionFromX(200, 200, true)).toBe(0);
  });

  it('clamps touches outside the track', () => {
    expect(fractionFromX(-30, 200, false)).toBe(0);
    expect(fractionFromX(400, 200, false)).toBe(1);
  });

  it('returns 0 for a zero-width track', () => {
    expect(fractionFromX(10, 0, false)).toBe(0);
  });
});
