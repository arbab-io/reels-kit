import * as React from 'react';
import { useEffect, useRef } from 'react';
import { Animated, StyleSheet } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

export interface DoubleTapLikeOverlayProps {
  icon: React.ReactNode;
  triggerKey: number | string;
  style?: StyleProp<ViewStyle>;
}

export function DoubleTapLikeOverlay({
  icon,
  triggerKey,
  style,
}: DoubleTapLikeOverlayProps): React.ReactElement {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // A falsy key means idle (e.g. a recycled cell resetting its state).
    if (!triggerKey) {
      opacity.setValue(0);
      return;
    }
    scale.setValue(0.5);
    opacity.setValue(1);
    Animated.sequence([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 4,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 350,
        delay: 250,
        useNativeDriver: true,
      }),
    ]).start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerKey]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.container, style, { opacity, transform: [{ scale }] }]}
    >
      {icon}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
