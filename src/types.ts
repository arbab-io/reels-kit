import type * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import type { FlashListRef } from '@shopify/flash-list';

export interface ReelsFeedRenderItemInfo<T> {
  item: T;
  index: number;
  isActive: boolean;
  shouldRenderMedia: boolean;
  isFocused: boolean;
  isForeground: boolean;
}

export interface ReelsFeedProps<T> {
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  renderItem: (info: ReelsFeedRenderItemInfo<T>) => React.ReactElement | null;
  itemHeight?: number;
  mediaRenderRadius?: number;
  drawDistance?: number;
  viewabilityThreshold?: number;
  isFocused?: boolean;
  isForeground?: boolean;
  onActiveIndexChange?: (index: number, item: T) => void;
  onItemImpression?: (index: number, item: T) => void;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  refreshing?: boolean;
  onRefresh?: () => void;
  ListEmptyComponent?: React.ComponentType | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType | React.ReactElement | null;
  extraData?: unknown;
  style?: StyleProp<ViewStyle>;
}

export interface ReelsFeedHandle<T> {
  scrollToIndex: (index: number, opts?: { animated?: boolean }) => void;
  scrollToId: (id: string, opts?: { animated?: boolean }) => boolean;
  scrollToTop: (opts?: { animated?: boolean }) => void;
  getActiveIndex: () => number;
  getListRef: () => FlashListRef<T> | null;
}
