import { I18nManager } from 'react-native';

import { clamp } from './clamp';

export function mirrorX(
  dx: number,
  isRTL: boolean = I18nManager.isRTL
): number {
  return isRTL ? -dx : dx;
}

// Maps a touch x inside a track to a 0..1 progress fraction; in RTL the
// track fills from the right, so the fraction is measured from that edge.
export function fractionFromX(
  x: number,
  trackWidth: number,
  isRTL: boolean = I18nManager.isRTL
): number {
  if (trackWidth <= 0) return 0;
  const fraction = clamp(x / trackWidth, 0, 1);
  return isRTL ? 1 - fraction : fraction;
}
