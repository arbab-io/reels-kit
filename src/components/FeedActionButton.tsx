import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type {
  AccessibilityRole,
  StyleProp,
  TextStyle,
  ViewStyle,
} from 'react-native';
import { formatCount } from '../utils/formatCount';

export interface FeedActionButtonProps {
  icon: React.ReactNode;
  label?: string;
  count?: number;
  onPress?: () => void;
  formatCount?: (n: number) => string;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
  countStyle?: StyleProp<TextStyle>;
}

export function FeedActionButton({
  icon,
  label,
  count,
  onPress,
  formatCount: formatCountProp = formatCount,
  accessibilityLabel,
  style,
  countStyle,
}: FeedActionButtonProps): React.ReactElement {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.container, style]}
      accessibilityRole={'button' as AccessibilityRole}
      accessibilityLabel={accessibilityLabel ?? label}
    >
      <View style={styles.iconWrapper}>{icon}</View>
      {typeof count === 'number' ? (
        <Text style={[styles.count, countStyle]}>{formatCountProp(count)}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  count: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
    textAlign: 'center',
  },
});
