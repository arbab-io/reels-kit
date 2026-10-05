import * as React from 'react';
import { useCallback } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import { useRecyclingState } from '@shopify/flash-list';
import type { ReelVideoComponent } from '../video/types';

export interface FeedVideoSlotProps {
  VideoComponent: ReelVideoComponent;
  sourceUri: string;
  thumbnailUri?: string;
  paused: boolean;
  muted: boolean;
  repeat?: boolean;
  resizeMode?: 'cover' | 'contain' | 'stretch';
  onProgress?: (e: { currentTimeSec: number }) => void;
  onLoad?: (e: { durationSec: number }) => void;
  onEnd?: () => void;
  renderThumbnail?: (
    thumbnailUri: string | undefined
  ) => React.ReactElement | null;
  renderError?: (retry: () => void) => React.ReactElement | null;
  renderBuffering?: () => React.ReactElement | null;
  style?: StyleProp<ViewStyle>;
}

export function FeedVideoSlot({
  VideoComponent,
  sourceUri,
  thumbnailUri,
  paused,
  muted,
  repeat = true,
  resizeMode = 'cover',
  onProgress,
  onLoad,
  onEnd,
  renderThumbnail,
  renderError,
  renderBuffering,
  style,
}: FeedVideoSlotProps): React.ReactElement {
  // Per-cell state resets whenever FlashList recycles this cell onto a new
  // source, so a recycled cell never shows the previous item's ready/error
  // state. Also works outside a FlashList (the layout context is optional).
  const [isReady, setIsReady] = useRecyclingState(false, [sourceUri]);
  const [isBuffering, setIsBuffering] = useRecyclingState(false, [sourceUri]);
  const [hasError, setHasError] = useRecyclingState(false, [sourceUri]);
  const [loadAttempt, setLoadAttempt] = useRecyclingState(0, [sourceUri]);

  const retry = useCallback(() => {
    setHasError(false);
    setIsReady(false);
    setLoadAttempt((attempt) => attempt + 1);
  }, [setHasError, setIsReady, setLoadAttempt]);

  if (hasError) {
    return (
      <View style={[styles.container, style]}>
        {renderError?.(retry) ?? null}
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <VideoComponent
        key={`${sourceUri}-${loadAttempt}`}
        sourceUri={sourceUri}
        paused={paused}
        muted={muted}
        repeat={repeat}
        resizeMode={resizeMode}
        style={StyleSheet.absoluteFill}
        onLoad={(e) => {
          onLoad?.(e);
        }}
        onProgress={onProgress}
        onReadyForDisplay={() => setIsReady(true)}
        onBuffer={(e) => setIsBuffering(e.isBuffering)}
        onEnd={onEnd}
        onError={() => setHasError(true)}
      />
      {!isReady ? (
        <View style={StyleSheet.absoluteFill}>
          {renderThumbnail ? (
            renderThumbnail(thumbnailUri)
          ) : thumbnailUri ? (
            <Image
              source={{ uri: thumbnailUri }}
              style={StyleSheet.absoluteFill}
            />
          ) : null}
        </View>
      ) : null}
      {isReady && isBuffering ? (renderBuffering?.() ?? null) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    overflow: 'hidden',
  },
});
