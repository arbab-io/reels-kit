import { forwardRef, useImperativeHandle, useRef } from 'react';
import Video from 'react-native-video';
import type { VideoRef } from 'react-native-video';
import type {
  ReelVideoComponent,
  ReelVideoHandle,
  ReelVideoProps,
} from '../../video/types';

// This is the ONLY file in the package that imports react-native-video —
// consumers who never import '@arbab-io/reels-kit/react-native-video' never pull it in.

export const RNVideoAdapter: ReelVideoComponent = forwardRef<
  ReelVideoHandle,
  ReelVideoProps
>(function RNVideoAdapterImpl(
  {
    sourceUri,
    paused,
    muted,
    repeat,
    resizeMode,
    onLoad,
    onProgress,
    onReadyForDisplay,
    onBuffer,
    onEnd,
    onError,
    audio,
    style,
  },
  ref
) {
  const videoRef = useRef<VideoRef>(null);

  useImperativeHandle(ref, () => ({
    seek: (seconds: number) => videoRef.current?.seek(seconds),
  }));

  return (
    <Video
      ref={videoRef}
      source={{ uri: sourceUri }}
      paused={paused}
      muted={muted}
      repeat={repeat}
      resizeMode={resizeMode}
      style={style}
      // ScrubBar's smoothingMs default assumes this interval.
      progressUpdateInterval={250}
      ignoreSilentSwitch={audio?.ignoreSilentSwitch ?? 'ignore'}
      mixWithOthers={audio?.mixWithOthers === 'mix' ? 'mix' : undefined}
      onLoad={(e) => onLoad?.({ durationSec: e.duration })}
      onProgress={(e) => onProgress?.({ currentTimeSec: e.currentTime })}
      onReadyForDisplay={() => onReadyForDisplay?.()}
      onBuffer={(e) => onBuffer?.({ isBuffering: e.isBuffering })}
      onEnd={() => onEnd?.()}
      onError={(e) => onError?.({ message: e?.error?.errorString })}
    />
  );
});
