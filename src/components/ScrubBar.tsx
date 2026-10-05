import * as React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { I18nManager, StyleSheet, View } from 'react-native';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useScrubGesture } from '../hooks/useScrubGesture';

// The video reports its position a few times a second, so the fill is animated
// linearly between updates to look continuous. Dragging, loops and backward
// seeks snap instead of animating.
// Needs a <GestureHandlerRootView> above it in the tree.
// TODO: feed progress through a shared value so only the bar
// re-renders per tick.

// Matches the adapters' default progress interval (react-native-video: 250ms).
const DEFAULT_SMOOTHING_MS = 250;

export interface ScrubBarProps {
  durationSec: number;
  currentTimeSec: number;
  onSeek?: (seconds: number) => void;
  // Roughly the interval between currentTimeSec updates. 0 disables smoothing.
  smoothingMs?: number;
  style?: StyleProp<ViewStyle>;
}

export function ScrubBar({
  durationSec,
  currentTimeSec,
  onSeek,
  smoothingMs = DEFAULT_SMOOTHING_MS,
  style,
}: ScrubBarProps): React.ReactElement {
  const [trackWidth, setTrackWidth] = useState(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    setTrackWidth(e.nativeEvent.layout.width);
  }, []);

  const { gesture, isScrubbing, progress } = useScrubGesture({
    durationSec,
    currentTimeSec,
    trackWidth,
    onSeek: onSeek ?? noop,
    enabled: onSeek != null,
    isRTL: I18nManager.isRTL,
  });

  const fill = useSharedValue(progress);
  const previousProgress = useRef(progress);

  useEffect(() => {
    const movedForward = progress > previousProgress.current;
    previousProgress.current = progress;
    if (isScrubbing || !movedForward || smoothingMs <= 0) {
      fill.value = progress;
    } else {
      fill.value = withTiming(progress, {
        duration: smoothingMs,
        easing: Easing.linear,
      });
    }
  }, [progress, isScrubbing, smoothingMs, fill]);

  const fillStyle = useAnimatedStyle(() => ({
    width: `${fill.value * 100}%`,
  }));

  return (
    <GestureDetector gesture={gesture}>
      <View
        style={[styles.hitArea, style]}
        onLayout={onLayout}
        accessibilityRole="adjustable"
        accessibilityLabel="Video progress"
        accessibilityValue={{
          min: 0,
          max: 100,
          now: Math.round(progress * 100),
        }}
      >
        <View style={[styles.track, isScrubbing && styles.trackActive]}>
          <Animated.View style={[styles.fill, fillStyle]} />
        </View>
      </View>
    </GestureDetector>
  );
}

function noop() {}

const styles = StyleSheet.create({
  // Tall transparent touch target around a thin visual track.
  hitArea: {
    height: 28,
    width: '100%',
    justifyContent: 'center',
  },
  track: {
    height: 2,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  trackActive: {
    height: 4,
  },
  fill: {
    height: '100%',
    backgroundColor: '#fff',
  },
});
