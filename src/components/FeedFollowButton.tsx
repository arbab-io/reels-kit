import * as React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

export interface FeedFollowButtonProps {
  isFollowing?: boolean;
  followLabel?: string;
  followingLabel?: string;
  onPress?: () => void;
  // Applied in both states; the *Following* variants are added on top when
  // isFollowing is true.
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  followingStyle?: StyleProp<ViewStyle>;
  followingTextStyle?: StyleProp<TextStyle>;
}

export function FeedFollowButton({
  isFollowing = false,
  followLabel = 'Follow',
  followingLabel = 'Following',
  onPress,
  style,
  textStyle,
  followingStyle,
  followingTextStyle,
}: FeedFollowButtonProps): React.ReactElement {
  const label = isFollowing ? followingLabel : followLabel;
  return (
    <Pressable
      onPress={onPress}
      style={[styles.button, style, isFollowing && followingStyle]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      <Text style={[styles.text, textStyle, isFollowing && followingTextStyle]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#fff',
  },
  text: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
});
