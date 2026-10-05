import { describe, expect, it, jest } from '@jest/globals';
import { createElement } from 'react';
import { act, create } from 'react-test-renderer';
import { useCursorPagination } from '../hooks/useCursorPagination';
import { useFeedTargetItem } from '../hooks/useFeedTargetItem';

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

function renderHook<R>(hook: () => R) {
  const result = { current: undefined as unknown as R };
  function Probe() {
    result.current = hook();
    return null;
  }
  let renderer!: ReturnType<typeof create>;
  act(() => {
    renderer = create(createElement(Probe));
  });
  return {
    result,
    rerender: () =>
      act(() => {
        renderer.update(createElement(Probe));
      }),
    unmount: () => act(() => renderer.unmount()),
  };
}

interface Item {
  id: string;
}

const item = (id: string): Item => ({ id });
const getId = (i: Item) => i.id;

type Page = { items: Item[]; nextCursor: string | undefined; hasMore: boolean };

describe('useCursorPagination', () => {
  it('loads pages with the cursor from the previous page', async () => {
    const pages: Record<string, Page> = {
      first: { items: [item('a'), item('b')], nextCursor: 'p2', hasMore: true },
      p2: { items: [item('c')], nextCursor: undefined, hasMore: false },
    };
    const fetchPage = jest.fn(async (cursor: string | undefined) => {
      return pages[cursor ?? 'first'] as Page;
    });
    const { result } = renderHook(() =>
      useCursorPagination({ getId, fetchPage })
    );

    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.items.map(getId)).toEqual(['a', 'b']);
    expect(result.current.hasMore).toBe(true);

    await act(async () => {
      await result.current.loadMore();
    });
    expect(fetchPage).toHaveBeenNthCalledWith(1, undefined);
    expect(fetchPage).toHaveBeenNthCalledWith(2, 'p2');
    expect(result.current.items.map(getId)).toEqual(['a', 'b', 'c']);
    expect(result.current.hasMore).toBe(false);
  });

  it('does not fetch again once hasMore is false', async () => {
    const fetchPage = jest.fn(async () => ({
      items: [item('a')],
      nextCursor: undefined,
      hasMore: false,
    }));
    const { result } = renderHook(() =>
      useCursorPagination({ getId, fetchPage })
    );

    await act(async () => {
      await result.current.loadMore();
    });
    await act(async () => {
      await result.current.loadMore();
    });
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it('ignores a second loadMore while one is in flight', async () => {
    let resolve!: (page: Page) => void;
    const fetchPage = jest.fn(
      () =>
        new Promise<Page>((r) => {
          resolve = r;
        })
    );
    const { result } = renderHook(() =>
      useCursorPagination({ getId, fetchPage })
    );

    let first!: Promise<void>;
    act(() => {
      first = result.current.loadMore();
      result.current.loadMore();
    });
    expect(fetchPage).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolve({ items: [item('a')], nextCursor: undefined, hasMore: false });
      await first;
    });
    expect(result.current.items).toHaveLength(1);
    expect(result.current.isLoading).toBe(false);
  });

  it('drops items it has already seen', async () => {
    const pages: Page[] = [
      { items: [item('a'), item('b')], nextCursor: 'n', hasMore: true },
      { items: [item('b'), item('c')], nextCursor: undefined, hasMore: false },
    ];
    let call = 0;
    const fetchPage = jest.fn(async () => pages[call++] as Page);
    const { result } = renderHook(() =>
      useCursorPagination({ getId, fetchPage })
    );

    await act(async () => {
      await result.current.loadMore();
    });
    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.items.map(getId)).toEqual(['a', 'b', 'c']);
  });

  it('keeps the list, reports the error and recovers on the next call', async () => {
    let fail = true;
    const fetchPage = jest.fn(async () => {
      if (fail) throw new Error('network');
      return { items: [item('a')], nextCursor: undefined, hasMore: false };
    });
    const { result } = renderHook(() =>
      useCursorPagination({ getId, fetchPage })
    );

    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.items).toEqual([]);
    expect(result.current.isLoading).toBe(false);

    fail = false;
    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.error).toBeNull();
    expect(result.current.items.map(getId)).toEqual(['a']);
  });

  it('refresh starts again from the first page and forgets seen ids', async () => {
    const fetchPage = jest.fn(async (cursor: string | undefined) =>
      cursor === undefined
        ? { items: [item('a'), item('b')], nextCursor: 'p2', hasMore: true }
        : { items: [item('c')], nextCursor: undefined, hasMore: false }
    );
    const { result } = renderHook(() =>
      useCursorPagination({ getId, fetchPage })
    );

    await act(async () => {
      await result.current.loadMore();
    });
    await act(async () => {
      await result.current.loadMore();
    });
    expect(result.current.items.map(getId)).toEqual(['a', 'b', 'c']);

    await act(async () => {
      await result.current.refresh();
    });
    expect(fetchPage).toHaveBeenLastCalledWith(undefined);
    expect(result.current.items.map(getId)).toEqual(['a', 'b']);
    expect(result.current.hasMore).toBe(true);
  });
});

describe('useFeedTargetItem', () => {
  const base = [item('a'), item('b')];

  it('returns the base items when there is no target', () => {
    const fetchItem = jest.fn(async () => item('x'));
    const { result } = renderHook(() =>
      useFeedTargetItem({
        targetId: undefined,
        fetchItem,
        getId,
        baseItems: base,
      })
    );
    expect(result.current.items).toBe(base);
    expect(fetchItem).not.toHaveBeenCalled();
  });

  it('does not fetch when the target is already in the base items', () => {
    const fetchItem = jest.fn(async () => item('b'));
    const { result } = renderHook(() =>
      useFeedTargetItem({ targetId: 'b', fetchItem, getId, baseItems: base })
    );
    expect(fetchItem).not.toHaveBeenCalled();
    expect(result.current.items).toBe(base);
  });

  it('fetches a missing target and puts it first', async () => {
    const fetchItem = jest.fn(async (id: string) => item(id));
    const { result } = renderHook(() =>
      useFeedTargetItem({ targetId: 'z', fetchItem, getId, baseItems: base })
    );
    await act(async () => {});
    expect(fetchItem).toHaveBeenCalledWith('z');
    expect(result.current.items.map(getId)).toEqual(['z', 'a', 'b']);
    expect(result.current.isResolving).toBe(false);
  });

  it('does not duplicate the target once the base list contains it', async () => {
    const fetchItem = jest.fn(async (id: string) => item(id));
    let current = base;
    const { result, rerender } = renderHook(() =>
      useFeedTargetItem({
        targetId: 'z',
        fetchItem,
        getId,
        baseItems: current,
      })
    );
    await act(async () => {});
    expect(result.current.items.map(getId)).toEqual(['z', 'a', 'b']);

    current = [item('a'), item('z'), item('b')];
    rerender();
    expect(result.current.items.map(getId)).toEqual(['z', 'a', 'b']);
  });

  it('reports a fetch error and falls back to the base items', async () => {
    const fetchItem = jest.fn(async () => {
      throw new Error('not found');
    });
    const { result } = renderHook(() =>
      useFeedTargetItem({ targetId: 'z', fetchItem, getId, baseItems: base })
    );
    await act(async () => {});
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.items).toBe(base);
    expect(result.current.isResolving).toBe(false);
  });

  it('ignores a stale response when the target changes first', async () => {
    const resolvers: Record<string, (i: Item) => void> = {};
    const fetchItem = jest.fn(
      (id: string) =>
        new Promise<Item>((r) => {
          resolvers[id] = r;
        })
    );
    let targetId = 'first';
    const { result, rerender } = renderHook(() =>
      useFeedTargetItem({ targetId, fetchItem, getId, baseItems: base })
    );

    targetId = 'second';
    rerender();

    await act(async () => {
      resolvers.first?.(item('first'));
      resolvers.second?.(item('second'));
    });
    expect(result.current.items.map(getId)).toEqual(['second', 'a', 'b']);
  });
});
