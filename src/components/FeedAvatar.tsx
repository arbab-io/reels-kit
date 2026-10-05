import * as React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface FeedAvatarProps {
  uri?: string;
  size?: number;
  fallbackLabel?: string;
  onPress?: () => void;
  // Wrapper around the avatar (margins, positioning).
  style?: StyleProp<ViewStyle>;
  // Applied after the default circle, so borderRadius/borderWidth/borderColor
  // can turn it into a rounded square or add a ring.
  imageStyle?: StyleProp<ImageStyle>;
  fallbackStyle?: StyleProp<ViewStyle>;
  fallbackTextStyle?: StyleProp<TextStyle>;
}

export function FeedAvatar({
  uri,
  size = 36,
  fallbackLabel,
  onPress,
  style,
  imageStyle,
  fallbackStyle,
  fallbackTextStyle,
}: FeedAvatarProps): React.ReactElement {
  const dimensionStyle = { width: size, height: size, borderRadius: size / 2 };
  const content = uri ? (
    <Image
      source={{ uri }}
      style={[styles.image, dimensionStyle, imageStyle]}
    />
  ) : (
    <View style={[styles.fallback, dimensionStyle, fallbackStyle]}>
      <Text style={[styles.fallbackText, fallbackTextStyle]}>
        {fallbackLabel?.trim().charAt(0).toUpperCase() ?? '?'}
      </Text>
    </View>
  );

  if (!onPress) return <View style={style}>{content}</View>;

  return (
    <Pressable onPress={onPress} style={style} accessibilityRole="button">
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  image: {
    backgroundColor: '#333',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#555',
  },
  fallbackText: {
    color: '#fff',
    fontWeight: '600',
  },
});
