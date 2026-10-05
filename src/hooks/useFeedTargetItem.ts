import { useEffect, useMemo, useState } from 'react';

export interface UseFeedTargetItemArgs<T> {
  targetId: string | undefined;
  fetchItem: (id: string) => Promise<T | undefined>;
  getId: (item: T) => string;
  baseItems: T[];
}

export interface UseFeedTargetItemResult<T> {
  items: T[];
  isResolving: boolean;
  error: unknown;
}

export function useFeedTargetItem<T>({
  targetId,
  fetchItem,
  getId,
  baseItems,
}: UseFeedTargetItemArgs<T>): UseFeedTargetItemResult<T> {
  const [resolvedItem, setResolvedItem] = useState<T | undefined>(undefined);
  const [isResolving, setIsResolving] = useState(false);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    if (!targetId) {
      setResolvedItem(undefined);
      setError(null);
      return;
    }
    const alreadyPresent = baseItems.find((item) => getId(item) === targetId);
    if (alreadyPresent) {
      setResolvedItem(undefined);
      return;
    }
    let cancelled = false;
    setIsResolving(true);
    setError(null);
    fetchItem(targetId)
      .then((item) => {
        if (!cancelled) setResolvedItem(item);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setIsResolving(false);
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetId]);

  const items = useMemo(() => {
    if (!resolvedItem) return baseItems;
    const targetIdValue = getId(resolvedItem);
    const withoutDuplicate = baseItems.filter(
      (item) => getId(item) !== targetIdValue
    );
    return [resolvedItem, ...withoutDuplicate];
  }, [baseItems, resolvedItem, getId]);

  return { items, isResolving, error };
}
