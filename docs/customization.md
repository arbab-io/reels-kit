# Customizing the building blocks

`reels-kit` ships headless pieces, not a fixed layout: you compose the cell yourself
inside `ReelsFeed`'s `renderItem`. Everything below is verified in
[empty-app-quickstart.md](empty-app-quickstart.md).

## Action icons (like, comment, share, more)

`FeedActionButton` takes any `ReactNode` as `icon`, so use text glyphs, SVG, or your
icon library. Swap the icon (and its color) for the active state yourself:

```tsx
<FeedActionButton
  icon={<Text style={{ fontSize: 30, color: liked ? '#ff3040' : '#fff' }}>{liked ? '♥' : '♡'}</Text>}
  label="Like"
  count={likes}
  countStyle={{ fontSize: 13, fontWeight: '700' }}
  onPress={toggleLike}
/>
```

## Avatar

`FeedAvatar` props: `size`, `style` (wrapper), `imageStyle`, `fallbackStyle`,
`fallbackTextStyle`. Style overrides apply after the default circle, so
`borderRadius` gives a rounded square and `borderWidth`/`borderColor` add a ring.

## Follow button

`FeedFollowButton` props: `isFollowing`, `followLabel`, `followingLabel`, `onPress`,
`style`, `textStyle`, `followingStyle`, `followingTextStyle`. The `following*` styles
are layered on top of the base styles while `isFollowing` is true.

## Other pieces

- `FeedCaption`: `style`, `maxLength`, `moreLabel`, `lessLabel`.
- `ScrubBar`: `style` (position it; the touch area is taller than the 2 px track).
- `MuteIndicatorOverlay`: `mutedIcon`, `unmutedIcon`, `size`, `holdMs`.
- `DoubleTapLikeOverlay`: `icon`.
