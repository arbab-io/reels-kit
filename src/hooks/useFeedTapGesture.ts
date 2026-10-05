import {
  useExclusiveGestures,
  useTapGesture,
} from 'react-native-gesture-handler';
import type { ComposedGesture } from 'react-native-gesture-handler';

export interface UseFeedTapGestureArgs {
  onSingleTap?: () => void;
  onDoubleTap?: () => void;
  enableDoubleTap?: boolean;
  doubleTapMaxDelay?: number;
}

// Single tap (e.g. mute toggle) with opt-in double tap (e.g. like). Built on
// Gesture Handler 3's hook API: the double tap is listed first, so the single
// tap only fires once the double tap has failed. Pass the result to
// <GestureDetector gesture={...}>.
export function useFeedTapGesture({
  onSingleTap,
  onDoubleTap,
  enableDoubleTap = false,
  doubleTapMaxDelay = 250,
}: UseFeedTapGestureArgs): ComposedGesture {
  const doubleTap = useTapGesture({
    numberOfTaps: 2,
    maxDelay: doubleTapMaxDelay,
    enabled: enableDoubleTap,
    runOnJS: true,
    onActivate: () => onDoubleTap?.(),
  });

  const singleTap = useTapGesture({
    numberOfTaps: 1,
    runOnJS: true,
    onActivate: () => onSingleTap?.(),
  });

  return useExclusiveGestures(doubleTap, singleTap);
}
