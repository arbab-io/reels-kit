export function shouldRenderMedia(
  index: number,
  activeIndex: number,
  radius: number
): boolean {
  return Math.abs(index - activeIndex) <= radius;
}
