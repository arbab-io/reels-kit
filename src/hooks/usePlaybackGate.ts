export interface UsePlaybackGateArgs {
  isActive: boolean;
  isFocused?: boolean;
  isForeground?: boolean;
}

export function usePlaybackGate({
  isActive,
  isFocused = true,
  isForeground = true,
}: UsePlaybackGateArgs): boolean {
  return !isActive || !isFocused || !isForeground;
}
