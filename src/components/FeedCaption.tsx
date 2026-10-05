import * as React from 'react';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

export interface FeedCaptionProps {
  text: string;
  maxLength?: number;
  moreLabel?: string;
  lessLabel?: string;
  style?: StyleProp<ViewStyle>;
}

export function FeedCaption({
  text,
  maxLength = 90,
  moreLabel = 'more',
  lessLabel,
  style,
}: FeedCaptionProps): React.ReactElement | null {
  const [expanded, setExpanded] = useState(false);

  if (!text) return null;

  const isTruncatable = text.length > maxLength;
  const displayText =
    isTruncatable && !expanded
      ? `${text.slice(0, maxLength).trimEnd()}… `
      : `${text} `;

  return (
    <Text style={[styles.text, style]}>
      {displayText}
      {isTruncatable ? (
        <Text
          style={styles.toggle}
          onPress={() => setExpanded((prev) => !prev)}
          suppressHighlighting
        >
          {expanded ? (lessLabel ?? '') : moreLabel}
        </Text>
      ) : null}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    color: '#fff',
    fontSize: 14,
  },
  toggle: {
    color: '#ddd',
    fontWeight: '600',
  },
});
