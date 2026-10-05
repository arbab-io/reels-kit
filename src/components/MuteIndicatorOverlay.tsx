import * as React from 'react';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { MutedGlyph, UnmutedGlyph } from './internal/defaultGlyphs';

export interface MuteIndicatorOverlayProps {
  isMuted: boolean;
  // Change this (e.g. increment on every tap) to flash the indicator.
  // A falsy value (0 or '') means idle, so a reset never plays the animation.
  triggerKey: number | string;
  mutedIcon?: React.ReactNode;
  unmutedIcon?: React.ReactNode;
  size?: number;
  holdMs?: number;
  style?: StyleProp<ViewStyle>;
}

// Centered circle on a 60% black background that flashes the current
// muted/unmuted icon and fades out. Meant to sit over the video and flash on
// each tap-to-mute.
export function MuteIndicatorOverlay({
  isMuted,
  triggerKey,
  mutedIcon,
  unmutedIcon,
  size = 64,
  holdMs = 600,
  style,
}: MuteIndicatorOverlayProps): React.ReactElement {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.8)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (!triggerKey) {
      opacity.setValue(0);
      return;
    }
    scale.setValue(0.8);
    opacity.setValue(0);
    const animation = Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 120,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 250,
          delay: holdMs,
          useNativeDriver: true,
        }),
      ]),
    ]);
    animation.start();
    return () => animation.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, style, { opacity }]}
    >
      <Animated.View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale }],
          },
        ]}
      >
        <View>
          {isMuted
            ? (mutedIcon ?? <MutedGlyph />)
            : (unmutedIcon ?? <UnmutedGlyph />)}
        </View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
});
