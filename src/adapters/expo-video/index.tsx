import { forwardRef } from 'react';
import type {
  ReelVideoComponent,
  ReelVideoHandle,
  ReelVideoProps,
} from '../../video/types';

// TODO: not implemented. expo-video is player-object based (useVideoPlayer +
// <VideoView>), not props-based, so it has to be wrapped to fit
// ReelVideoComponent. timeUpdateEventInterval must be set explicitly (Expo's
// timeUpdate event is off by default) and the player lifecycle across
// FlashList cell recycling needs validating before this adapter is real.

export const ExpoVideoAdapter: ReelVideoComponent = forwardRef<
  ReelVideoHandle,
  ReelVideoProps
>(function ExpoVideoAdapterImpl() {
  throw new Error('ExpoVideoAdapter is not implemented yet.');
});
