import type * as React from 'react';
import type { StyleProp, ViewStyle } from 'react-native';

export interface ReelVideoHandle {
  seek(seconds: number): void;
}

export interface ReelVideoProps {
  sourceUri: string;
  paused: boolean;
  muted: boolean;
  repeat?: boolean;
  resizeMode?: 'cover' | 'contain' | 'stretch';
  onLoad?: (e: { durationSec: number }) => void;
  onProgress?: (e: { currentTimeSec: number }) => void;
  onReadyForDisplay?: () => void;
  onBuffer?: (e: { isBuffering: boolean }) => void;
  onEnd?: () => void;
  onError?: (e: { message?: string }) => void;
  audio?: {
    ignoreSilentSwitch?: 'ignore' | 'obey';
    mixWithOthers?: 'inherit' | 'mix' | 'duck';
  };
  style?: StyleProp<ViewStyle>;
}

export type ReelVideoComponent = React.ForwardRefExoticComponent<
  ReelVideoProps & React.RefAttributes<ReelVideoHandle>
>;
