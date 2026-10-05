import { describe, expect, it } from '@jest/globals';
import {
  usePlaybackGate,
  type UsePlaybackGateArgs,
} from '../hooks/usePlaybackGate';

describe('usePlaybackGate', () => {
  it.each<[UsePlaybackGateArgs, boolean]>([
    [{ isActive: true, isFocused: true, isForeground: true }, false],
    [{ isActive: false, isFocused: true, isForeground: true }, true],
    [{ isActive: true, isFocused: false, isForeground: true }, true],
    [{ isActive: true, isFocused: true, isForeground: false }, true],
    [{ isActive: false, isFocused: false, isForeground: false }, true],
  ])('%j -> paused=%s', (args, expected) => {
    expect(usePlaybackGate(args)).toBe(expected);
  });

  it('defaults isFocused/isForeground to true', () => {
    expect(usePlaybackGate({ isActive: true })).toBe(false);
    expect(usePlaybackGate({ isActive: false })).toBe(true);
  });
});
