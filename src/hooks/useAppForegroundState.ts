import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

export function useAppForegroundState(): boolean {
  const [isForeground, setIsForeground] = useState(
    AppState.currentState === 'active'
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextState) => {
      setIsForeground(nextState === 'active');
    });
    return () => subscription.remove();
  }, []);

  return isForeground;
}
