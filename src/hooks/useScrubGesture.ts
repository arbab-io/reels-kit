import { useCallback, useRef, useState } from 'react';
import { usePanGesture } from 'react-native-gesture-handler';
import type { PanGesture } from 'react-native-gesture-handler';
import { fractionFromX } from '../utils/rtl';

// After a drag ends the video keeps reporting its old position until the seek
// lands. Showing those ticks makes the thumb snap back, so the target is held
// until the video catches up (or the hold times out).
const SEEK_HOLD_MS = 800;
const SEEK_CATCH_UP_SEC = 0.5;

export interface UseScrubGestureArgs {
  durationSec: number;
  currentTimeSec: number;
  trackWidth: number;
  onSeek: (seconds: number) => void;
  enabled?: boolean;
  isRTL?: boolean;
}

export interface UseScrubGestureResult {
  gesture: PanGesture;
  isScrubbing: boolean;
  // 0..1, what the bar should display: the scrub position while dragging or
  // holding a pending seek, otherwise the playback position.
  progress: number;
}

export function useScrubGesture({
  durationSec,
  currentTimeSec,
  trackWidth,
  onSeek,
  enabled = true,
  isRTL,
}: UseScrubGestureArgs): UseScrubGestureResult {
  const [scrubFraction, setScrubFraction] = useState<number | null>(null);
  const pendingSeek = useRef<{ target: number; until: number } | null>(null);

  const toFraction = useCallback(
    (x: number) => fractionFromX(x, trackWidth, isRTL),
    [trackWidth, isRTL]
  );

  // Activate on a small horizontal move, fail on vertical drift so the
  // parent's page scroll wins. No minDistance: Gesture Handler 3 throws at
  // runtime if it is combined with failOffsetX/Y (unlike GH2).
  const gesture = usePanGesture({
    activeOffsetX: [-5, 5],
    failOffsetY: [-10, 10],
    enabled: enabled && durationSec > 0 && trackWidth > 0,
    runOnJS: true,
    onActivate: (e) => {
      pendingSeek.current = null;
      setScrubFraction(toFraction(e.x));
    },
    onUpdate: (e) => {
      setScrubFraction(toFraction(e.x));
    },
    onDeactivate: (e) => {
      setScrubFraction(null);
      if (e.canceled) return;
      const target = toFraction(e.x) * durationSec;
      pendingSeek.current = { target, until: Date.now() + SEEK_HOLD_MS };
      onSeek(target);
    },
  });

  let progress = durationSec > 0 ? currentTimeSec / durationSec : 0;
  const pending = pendingSeek.current;
  if (scrubFraction !== null) {
    progress = scrubFraction;
  } else if (pending) {
    const caughtUp =
      Math.abs(currentTimeSec - pending.target) <= SEEK_CATCH_UP_SEC;
    if (caughtUp || Date.now() > pending.until) {
      pendingSeek.current = null;
    } else if (durationSec > 0) {
      progress = pending.target / durationSec;
    }
  }

  return {
    gesture,
    isScrubbing: scrubFraction !== null,
    progress: Math.min(Math.max(progress, 0), 1),
  };
}
