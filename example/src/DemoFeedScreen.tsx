import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ReelsFeed } from 'reels-kit';
import type { ReelsFeedRenderItemInfo } from 'reels-kit';

// Paging, snap feel and active/render-radius gating with plain colored boxes,
// before any video is involved.

interface Box {
  id: string;
  color: string;
}

const COLORS = ['#e63946', '#f4a261', '#2a9d8f', '#457b9d', '#6a4c93'];

function makeBoxes(count: number, offset = 0): Box[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `box-${offset + i}`,
    color: COLORS[(offset + i) % COLORS.length] ?? '#000',
  }));
}

const keyExtractor = (item: Box) => item.id;

export default function DemoFeedScreen() {
  const [boxes, setBoxes] = useState(() => makeBoxes(12));
  const [activeIndex, setActiveIndex] = useState(0);

  const renderItem = useCallback(
    ({
      item,
      index,
      isActive,
      shouldRenderMedia,
    }: ReelsFeedRenderItemInfo<Box>) => (
      <View style={[styles.box, { backgroundColor: item.color }]}>
        <Text style={styles.index}>{index}</Text>
        <Text style={styles.flags}>
          {isActive ? 'ACTIVE' : 'idle'} ·{' '}
          {shouldRenderMedia ? 'media mounted' : 'media unmounted'}
        </Text>
      </View>
    ),
    []
  );

  const onEndReached = useCallback(() => {
    setBoxes((prev) => [...prev, ...makeBoxes(6, prev.length)]);
  }, []);

  return (
    <View style={styles.container}>
      <ReelsFeed
        data={boxes}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onActiveIndexChange={(index) => setActiveIndex(index)}
        onEndReached={onEndReached}
      />
      <View style={styles.hud} pointerEvents="none">
        <Text style={styles.hudText}>
          active {activeIndex} / {boxes.length}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  box: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  index: {
    color: '#fff',
    fontSize: 72,
    fontWeight: '700',
  },
  flags: {
    color: '#fff',
    fontSize: 14,
    marginTop: 8,
  },
  hud: {
    position: 'absolute',
    top: 56,
    left: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  hudText: {
    color: '#fff',
    fontSize: 12,
  },
});
