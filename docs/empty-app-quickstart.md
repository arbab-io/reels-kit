# Try reels-kit in an empty React Native app

Verified on iOS (iPhone 17 Pro simulator) with a fresh React Native 0.85.0 app, using the packed tarball.

## 1. Pack the package

```sh
cd path/to/reels-kit
yarn prepare && npm pack --pack-destination ~/Desktop
```

## 2. Create the empty app (path must NOT contain spaces)

```sh
cd ~/Desktop
npx @react-native-community/cli@latest init ReelsKitTest --version 0.85.0 --skip-git-init --install-pods false
cd ReelsKitTest
```

## 3. Install reels-kit and its peers

Pin the peers. A newer Reanimated may require a newer React Native than the app has
(Reanimated 4.7.x needs RN 0.86+; 4.5.3 supports RN 0.83 to 0.86).

```sh
npm install --save-exact ~/Desktop/reels-kit-0.1.1.tgz \
  @shopify/flash-list@2.3.2 \
  react-native-reanimated@4.5.3 \
  react-native-worklets@0.11.4 \
  react-native-gesture-handler@3.2.1 \
  react-native-video@6.19.2 \
  react-native-svg@15.15.5
```

`react-native-video` is only needed for the `reels-kit/react-native-video` adapter.
`react-native-svg` is only used by this demo for the comment and share icons.

## 4. babel.config.js

```js
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ['react-native-worklets/plugin'],
};
```

## 5. App.tsx

```tsx
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import { useRecyclingState } from '@shopify/flash-list';
import Svg, { Line, Path, Polygon } from 'react-native-svg';
import {
  DoubleTapLikeOverlay,
  FeedActionButton,
  FeedAvatar,
  FeedCaption,
  FeedFollowButton,
  FeedVideoSlot,
  MuteIndicatorOverlay,
  ReelsFeed,
  ScrubBar,
  useFeedTapGesture,
  usePlaybackGate,
} from 'reels-kit';
import type { ReelsFeedRenderItemInfo, ReelVideoHandle } from 'reels-kit';
import { RNVideoAdapter } from 'reels-kit/react-native-video';

interface Reel {
  id: string;
  uri: string;
  user: string;
  caption: string;
  likes: number;
}

const BASE = 'https://test-videos.co.uk/vids';
const SOURCES = [
  `${BASE}/bigbuckbunny/mp4/h264/360/Big_Buck_Bunny_360_10s_1MB.mp4`,
  `${BASE}/jellyfish/mp4/h264/360/Jellyfish_360_10s_1MB.mp4`,
  `${BASE}/sintel/mp4/h264/360/Sintel_360_10s_1MB.mp4`,
  'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
  'https://example.invalid/broken.mp4', // exercises retry-by-remount
];

const makeReels = (count: number, offset = 0): Reel[] =>
  Array.from({ length: count }, (_, i) => {
    const n = offset + i;
    return {
      id: `reel-${n}`,
      uri: SOURCES[n % SOURCES.length] ?? '',
      user: `creator_${n}`,
      caption:
        'Testing reels-kit from an empty React Native project. Tap to mute, double tap to like, drag the bar to scrub, long captions get a more link.',
      likes: 1200 * (n + 1),
    };
  });

const keyExtractor = (r: Reel) => r.id;

const ACCENT = '#ff3040';
const ICON_SIZE = 30;
const BOTTOM_INSET = 34;

// Every icon is just a ReactNode: swap these for your own SVG/icon components.
const Icon = ({ char, color = '#fff' }: { char: string; color?: string }) => (
  <Text style={{ fontSize: ICON_SIZE, color }}>{char}</Text>
);

// Minimal outline icons (Feather-style, 24x24 grid, 2px round strokes).
const strokeProps = {
  fill: 'none',
  stroke: '#fff',
  strokeWidth: 2,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

const CommentIcon = () => (
  <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
    <Path
      {...strokeProps}
      d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"
    />
  </Svg>
);

const ShareIcon = () => (
  <Svg width={ICON_SIZE} height={ICON_SIZE} viewBox="0 0 24 24">
    <Line {...strokeProps} x1="22" y1="2" x2="11" y2="13" />
    <Polygon {...strokeProps} points="22 2 15 22 11 13 2 9 22 2" />
  </Svg>
);

function ReelCell({
  reel,
  isActive,
  shouldRenderMedia,
  isFocused,
  isForeground,
  muted,
  onToggleMute,
}: {
  reel: Reel;
  muted: boolean;
  onToggleMute: () => void;
} & Omit<ReelsFeedRenderItemInfo<Reel>, 'item' | 'index'>) {
  const paused = usePlaybackGate({ isActive, isFocused, isForeground });
  const videoRef = useRef<ReelVideoHandle>(null);
  // Per-cell state resets when FlashList recycles this cell onto another reel.
  const [time, setTime] = useRecyclingState(0, [reel.id]);
  const [duration, setDuration] = useRecyclingState(0, [reel.id]);
  const [liked, setLiked] = useRecyclingState(false, [reel.id]);
  const [following, setFollowing] = useRecyclingState(false, [reel.id]);
  const [burst, setBurst] = useRecyclingState(0, [reel.id]);
  const [muteFlash, setMuteFlash] = useRecyclingState(0, [reel.id]);

  const gesture = useFeedTapGesture({
    onSingleTap: () => {
      onToggleMute();
      setMuteFlash((k) => k + 1);
    },
    onDoubleTap: () => {
      setLiked(true);
      setBurst((b) => b + 1);
    },
    enableDoubleTap: true,
  });

  return (
    <View style={styles.cell}>
      <GestureDetector gesture={gesture}>
        <View style={StyleSheet.absoluteFill}>
          {shouldRenderMedia ? (
            <FeedVideoSlot
              ref={videoRef}
              VideoComponent={RNVideoAdapter}
              sourceUri={reel.uri}
              paused={paused}
              muted={muted}
              onLoad={(e) => setDuration(e.durationSec)}
              onProgress={(e) => setTime(e.currentTimeSec)}
              renderError={(retry) => (
                <View style={styles.center}>
                  <Text style={styles.errorText} onPress={retry}>
                    Could not load video. Tap to retry
                  </Text>
                </View>
              )}
              renderBuffering={() => (
                <View style={styles.center}>
                  <Text style={styles.errorText}>Buffering…</Text>
                </View>
              )}
            />
          ) : null}
        </View>
      </GestureDetector>

      <DoubleTapLikeOverlay icon={<Icon char="♥" color="#fff" />} triggerKey={burst} />
      <MuteIndicatorOverlay isMuted={muted} triggerKey={muteFlash} />

      <View style={[styles.rail, { bottom: 96 + BOTTOM_INSET }]} pointerEvents="box-none">
        <FeedActionButton
          icon={<Icon char={liked ? '♥' : '♡'} color={liked ? ACCENT : '#fff'} />}
          label="Like"
          count={reel.likes + (liked ? 1 : 0)}
          onPress={() => setLiked((l) => !l)}
          countStyle={styles.count}
          style={styles.railItem}
        />
        <FeedActionButton icon={<CommentIcon />} label="Comment" count={128} countStyle={styles.count} style={styles.railItem} />
        <FeedActionButton icon={<ShareIcon />} label="Share" style={styles.railItem} />
        <FeedActionButton icon={<Icon char="⋮" />} label="More" />
      </View>

      <View style={[styles.bottom, { bottom: 24 + BOTTOM_INSET }]} pointerEvents="box-none">
        <View style={styles.userRow}>
          <FeedAvatar
            size={44}
            fallbackLabel={reel.user}
            imageStyle={styles.avatarShape}
            fallbackStyle={styles.avatarShape}
          />
          <Text style={styles.username} numberOfLines={1}>
            {reel.user}
          </Text>
          <FeedFollowButton
            isFollowing={following}
            onPress={() => setFollowing((f) => !f)}
            style={styles.followButton}
            followingStyle={styles.followingButton}
          />
        </View>
        <FeedCaption text={reel.caption} style={styles.caption} />
      </View>

      <ScrubBar
        durationSec={duration}
        currentTimeSec={time}
        onSeek={(seconds) => videoRef.current?.seek(seconds)}
        style={[styles.scrubBar, { bottom: BOTTOM_INSET }]}
      />
    </View>
  );
}

export default function App() {
  const [reels, setReels] = useState(() => makeReels(10));
  const [muted, setMuted] = useState(true);
  const toggleMute = useCallback(() => setMuted((m) => !m), []);

  const renderItem = useCallback(
    ({ item, isActive, shouldRenderMedia, isFocused, isForeground }: ReelsFeedRenderItemInfo<Reel>) => (
      <ReelCell
        reel={item}
        isActive={isActive}
        shouldRenderMedia={shouldRenderMedia}
        isFocused={isFocused}
        isForeground={isForeground}
        muted={muted}
        onToggleMute={toggleMute}
      />
    ),
    [muted, toggleMute]
  );

  return (
    <GestureHandlerRootView style={styles.root}>
      <ReelsFeed
        data={reels}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        extraData={muted}
        onEndReached={() => setReels((p) => [...p, ...makeReels(5, p.length)])}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  cell: { flex: 1, backgroundColor: '#000' },
  center: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center' },
  errorText: { color: '#fff', fontSize: 16 },
  rail: { position: 'absolute', right: 12, alignItems: 'center' },
  railItem: { marginBottom: 20 },
  count: { fontSize: 13, fontWeight: '700' },
  bottom: { position: 'absolute', left: 12, right: 72 },
  userRow: { flexDirection: 'row', alignItems: 'center' },
  avatarShape: { borderRadius: 12, borderWidth: 2, borderColor: ACCENT, backgroundColor: '#222' },
  username: { flexShrink: 1, marginLeft: 8, color: '#fff', fontSize: 15, fontWeight: '600' },
  followButton: { marginLeft: 8, backgroundColor: ACCENT, borderColor: ACCENT, borderRadius: 16, paddingHorizontal: 14 },
  followingButton: { backgroundColor: 'transparent', borderColor: '#fff' },
  caption: { marginTop: 6 },
  scrubBar: { position: 'absolute', left: 0, right: 0 },
});
```

## 6. Run

```sh
cd ios && LANG=en_US.UTF-8 pod install && cd ..
npx react-native run-ios
```

## Gotchas found while verifying

- **Newer Xcode may reject pods that target iOS 12.4** (seen with `react-native-svg`'s
  resource bundle on Xcode 27: "deployment target is set to 12.4"). Add this inside
  `post_install` in `ios/Podfile`, then run `pod install` again:

  ```ruby
  installer.pods_project.targets.each do |target|
    target.build_configurations.each do |config|
      current = config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'].to_f
      config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '15.1' if current > 0 && current < 15.0
    end
  end
  ```

- **Spaces in the project path break `pod install`** on RN 0.85 (the prebuilt core pod
  builds a file URI from the path). Keep the app in a space-free folder.
- **Gesture Handler 3 throws if `minDistance` is combined with `failOffsetX/Y`.**
  `useScrubGesture` already avoids this.
- `ScrubBar` and the gesture hooks need a `<GestureHandlerRootView>` near the app root.
- Reanimated, worklets and Gesture Handler versions must match the app's React Native version.
