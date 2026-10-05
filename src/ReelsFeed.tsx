import * as React from 'react';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { StyleSheet, View } from 'react-native';
import type {
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import type {
  FlashListRef,
  ListRenderItemInfo,
  ViewToken,
} from '@shopify/flash-list';
import { useAppForegroundState } from './hooks/useAppForegroundState';
import { clampScrollOffset } from './utils/ghostPageGuard';
import { shouldRenderMedia } from './utils/shouldRenderMedia';
import type { ReelsFeedHandle, ReelsFeedProps } from './types';

interface FeedExtraData {
  activeIndex: number;
  isFocused: boolean;
  isForeground: boolean;
  mediaRenderRadius: number;
  itemHeight: number;
  userExtra: unknown;
}

function ReelsFeedInner<T>(
  {
    data,
    keyExtractor,
    renderItem,
    itemHeight: itemHeightProp,
    mediaRenderRadius = 1,
    drawDistance,
    viewabilityThreshold = 80,
    isFocused = true,
    isForeground: isForegroundProp,
    onActiveIndexChange,
    onItemImpression,
    onEndReached,
    onEndReachedThreshold = 0.5,
    refreshing,
    onRefresh,
    ListEmptyComponent,
    ListFooterComponent,
    extraData,
    style,
  }: ReelsFeedProps<T>,
  ref: React.ForwardedRef<ReelsFeedHandle<T>>
): React.ReactElement {
  const listRef = useRef<FlashListRef<T>>(null);
  const trackedForeground = useAppForegroundState();
  const isForeground = isForegroundProp ?? trackedForeground;

  // Measured viewport height, not window height: edge-to-edge Android, notches
  // and tab bars make the two differ, and a few px of mismatch breaks snapping.
  const [measuredHeight, setMeasuredHeight] = useState(0);
  const itemHeight = itemHeightProp ?? measuredHeight;

  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const impressedKeys = useRef(new Set<string>());

  // The viewability callback is registered once, so it reads everything it
  // needs through a ref instead of closing over props.
  const latest = useRef({
    data,
    keyExtractor,
    onActiveIndexChange,
    onItemImpression,
  });
  latest.current = {
    data,
    keyExtractor,
    onActiveIndexChange,
    onItemImpression,
  };

  const viewabilityConfig = useMemo(
    () => ({ itemVisiblePercentThreshold: viewabilityThreshold }),
    [viewabilityThreshold]
  );

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken<T>[] }) => {
      const current = viewableItems.find(
        (token) => token.isViewable && token.index != null
      );
      if (!current || current.index == null) return;
      const index = current.index;
      const item = latest.current.data[index];
      if (item === undefined) return;

      if (index !== activeIndexRef.current) {
        activeIndexRef.current = index;
        setActiveIndex(index);
        latest.current.onActiveIndexChange?.(index, item);
      }

      const key = latest.current.keyExtractor(item, index);
      if (!impressedKeys.current.has(key)) {
        impressedKeys.current.add(key);
        latest.current.onItemImpression?.(index, item);
      }
    },
    []
  );

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (itemHeight <= 0) return;
      const offset = e.nativeEvent.contentOffset.y;
      const clamped = clampScrollOffset(offset, data.length, itemHeight);
      // Ghost-page guard: a fling can settle between pages or past the last one.
      if (Math.abs(clamped - offset) > 1) {
        listRef.current?.scrollToOffset({ offset: clamped, animated: true });
      }
    },
    [data.length, itemHeight]
  );

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { height } = e.nativeEvent.layout;
    setMeasuredHeight((prev) =>
      Math.abs(prev - height) > 0.5 ? height : prev
    );
  }, []);

  const feedExtraData = useMemo<FeedExtraData>(
    () => ({
      activeIndex,
      isFocused,
      isForeground,
      mediaRenderRadius,
      itemHeight,
      userExtra: extraData,
    }),
    [
      activeIndex,
      isFocused,
      isForeground,
      mediaRenderRadius,
      itemHeight,
      extraData,
    ]
  );

  const renderCell = useCallback(
    ({ item, index, extraData: extra }: ListRenderItemInfo<T>) => {
      const feed = extra as FeedExtraData;
      // Fixed page height comes from styling the cell; FlashList v2 measures
      // items itself and ignores overrideItemLayout sizes.
      return (
        <View style={{ height: feed.itemHeight }}>
          {renderItem({
            item,
            index,
            isActive: index === feed.activeIndex,
            shouldRenderMedia: shouldRenderMedia(
              index,
              feed.activeIndex,
              feed.mediaRenderRadius
            ),
            isFocused: feed.isFocused,
            isForeground: feed.isForeground,
          })}
        </View>
      );
    },
    [renderItem]
  );

  useImperativeHandle(
    ref,
    () => ({
      scrollToIndex: (index, opts) => {
        listRef.current?.scrollToIndex({
          index,
          animated: opts?.animated ?? true,
        });
      },
      scrollToId: (id, opts) => {
        const { data: items, keyExtractor: getKey } = latest.current;
        const index = items.findIndex((item, i) => getKey(item, i) === id);
        if (index < 0) return false;
        listRef.current?.scrollToIndex({
          index,
          animated: opts?.animated ?? true,
        });
        return true;
      },
      scrollToTop: (opts) => {
        listRef.current?.scrollToTop({ animated: opts?.animated ?? true });
      },
      getActiveIndex: () => activeIndexRef.current,
      getListRef: () => listRef.current,
    }),
    []
  );

  return (
    <View style={[styles.container, style]} onLayout={onLayout}>
      {itemHeight > 0 ? (
        <FlashList
          ref={listRef}
          data={data}
          keyExtractor={keyExtractor}
          renderItem={renderCell}
          extraData={feedExtraData}
          drawDistance={drawDistance ?? itemHeight}
          viewabilityConfig={viewabilityConfig}
          onViewableItemsChanged={onViewableItemsChanged}
          snapToInterval={itemHeight}
          disableIntervalMomentum
          decelerationRate="fast"
          showsVerticalScrollIndicator={false}
          onMomentumScrollEnd={onMomentumScrollEnd}
          onEndReached={onEndReached}
          onEndReachedThreshold={onEndReachedThreshold}
          refreshing={refreshing}
          onRefresh={onRefresh}
          ListEmptyComponent={ListEmptyComponent}
          ListFooterComponent={ListFooterComponent}
          // Off for a snap-paged feed so injected or prepended items never
          // shift the snapped page.
          maintainVisibleContentPosition={{ disabled: true }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export const ReelsFeed = forwardRef(ReelsFeedInner) as <T>(
  props: ReelsFeedProps<T> & { ref?: React.ForwardedRef<ReelsFeedHandle<T>> }
) => React.ReactElement;
