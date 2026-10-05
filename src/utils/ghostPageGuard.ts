import { clamp } from './clamp';

export function clampScrollOffset(
  offset: number,
  itemCount: number,
  itemHeight: number
): number {
  if (itemCount <= 0 || itemHeight <= 0) return 0;
  const maxOffset = (itemCount - 1) * itemHeight;
  const snapped = Math.round(offset / itemHeight) * itemHeight;
  return clamp(snapped, 0, maxOffset);
}
