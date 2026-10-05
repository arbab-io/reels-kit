import { useCallback, useRef, useState } from 'react';

export interface UseCursorPaginationArgs<T, C> {
  getId: (item: T) => string;
  fetchPage: (cursor: C | undefined) => Promise<{
    items: T[];
    nextCursor: C | undefined;
    hasMore: boolean;
  }>;
}

export interface UseCursorPaginationResult<T> {
  items: T[];
  hasMore: boolean;
  isLoading: boolean;
  error: unknown;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useCursorPagination<T, C = string>({
  getId,
  fetchPage,
}: UseCursorPaginationArgs<T, C>): UseCursorPaginationResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const cursorRef = useRef<C | undefined>(undefined);
  const inFlightRef = useRef(false);
  const seenIdsRef = useRef(new Set<string>());

  const loadMore = useCallback(async () => {
    if (inFlightRef.current || !hasMore) return;
    inFlightRef.current = true;
    setIsLoading(true);
    setError(null);
    try {
      const page = await fetchPage(cursorRef.current);
      const deduped = page.items.filter((item) => {
        const id = getId(item);
        if (seenIdsRef.current.has(id)) return false;
        seenIdsRef.current.add(id);
        return true;
      });
      setItems((prev) => [...prev, ...deduped]);
      cursorRef.current = page.nextCursor;
      setHasMore(page.hasMore);
    } catch (err) {
      setError(err);
    } finally {
      inFlightRef.current = false;
      setIsLoading(false);
    }
  }, [fetchPage, getId, hasMore]);

  const refresh = useCallback(async () => {
    cursorRef.current = undefined;
    seenIdsRef.current = new Set();
    inFlightRef.current = false;
    setItems([]);
    setHasMore(true);
    setError(null);
    setIsLoading(true);
    try {
      const page = await fetchPage(undefined);
      const deduped = page.items.filter((item) => {
        const id = getId(item);
        if (seenIdsRef.current.has(id)) return false;
        seenIdsRef.current.add(id);
        return true;
      });
      setItems(deduped);
      cursorRef.current = page.nextCursor;
      setHasMore(page.hasMore);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage, getId]);

  return { items, hasMore, isLoading, error, loadMore, refresh };
}
