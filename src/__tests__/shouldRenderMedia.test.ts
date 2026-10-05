import { describe, expect, it } from '@jest/globals';
import { shouldRenderMedia } from '../utils/shouldRenderMedia';

describe('shouldRenderMedia', () => {
  it('renders the active item', () => {
    expect(shouldRenderMedia(3, 3, 1)).toBe(true);
    expect(shouldRenderMedia(3, 3, 0)).toBe(true);
  });

  it('renders neighbours within the radius', () => {
    expect(shouldRenderMedia(2, 3, 1)).toBe(true);
    expect(shouldRenderMedia(4, 3, 1)).toBe(true);
  });

  it('skips items outside the radius', () => {
    expect(shouldRenderMedia(1, 3, 1)).toBe(false);
    expect(shouldRenderMedia(5, 3, 1)).toBe(false);
    expect(shouldRenderMedia(2, 3, 0)).toBe(false);
  });
});
