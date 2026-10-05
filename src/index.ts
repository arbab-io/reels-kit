export { ReelsFeed } from './ReelsFeed';
export type {
  ReelsFeedProps,
  ReelsFeedRenderItemInfo,
  ReelsFeedHandle,
} from './types';

export type {
  ReelVideoComponent,
  ReelVideoHandle,
  ReelVideoProps,
} from './video/types';

export { usePlaybackGate } from './hooks/usePlaybackGate';
export type { UsePlaybackGateArgs } from './hooks/usePlaybackGate';
export { useAppForegroundState } from './hooks/useAppForegroundState';
export { useFeedTapGesture } from './hooks/useFeedTapGesture';
export type { UseFeedTapGestureArgs } from './hooks/useFeedTapGesture';
export { useScrubGesture } from './hooks/useScrubGesture';
export type { UseScrubGestureArgs } from './hooks/useScrubGesture';
export { useFeedTargetItem } from './hooks/useFeedTargetItem';
export type {
  UseFeedTargetItemArgs,
  UseFeedTargetItemResult,
} from './hooks/useFeedTargetItem';
export { useCursorPagination } from './hooks/useCursorPagination';
export type {
  UseCursorPaginationArgs,
  UseCursorPaginationResult,
} from './hooks/useCursorPagination';

export { ScrubBar } from './components/ScrubBar';
export type { ScrubBarProps } from './components/ScrubBar';
export { FeedActionButton } from './components/FeedActionButton';
export type { FeedActionButtonProps } from './components/FeedActionButton';
export { FeedCaption } from './components/FeedCaption';
export type { FeedCaptionProps } from './components/FeedCaption';
export { FeedFollowButton } from './components/FeedFollowButton';
export type { FeedFollowButtonProps } from './components/FeedFollowButton';
export { FeedAvatar } from './components/FeedAvatar';
export type { FeedAvatarProps } from './components/FeedAvatar';
export { DoubleTapLikeOverlay } from './components/DoubleTapLikeOverlay';
export type { DoubleTapLikeOverlayProps } from './components/DoubleTapLikeOverlay';
export { MuteIndicatorOverlay } from './components/MuteIndicatorOverlay';
export type { MuteIndicatorOverlayProps } from './components/MuteIndicatorOverlay';
export { FeedVideoSlot } from './components/FeedVideoSlot';
export type { FeedVideoSlotProps } from './components/FeedVideoSlot';

export { clamp } from './utils/clamp';
export { clampScrollOffset } from './utils/ghostPageGuard';
export { formatCount } from './utils/formatCount';
export { shouldRenderMedia } from './utils/shouldRenderMedia';
export { mirrorX } from './utils/rtl';
