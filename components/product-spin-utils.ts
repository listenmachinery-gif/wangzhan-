export function getFrameIndexFromPointer(offsetX: number, width: number, frameCount: number) {
  if (!Number.isFinite(offsetX) || !Number.isFinite(width) || !Number.isFinite(frameCount)) {
    return 0;
  }

  const safeFrameCount = Math.max(0, Math.floor(frameCount));
  if (width <= 0 || safeFrameCount === 0) {
    return 0;
  }

  const normalizedPosition = Math.min(Math.max(offsetX / width, 0), 1);
  return Math.min(Math.floor(normalizedPosition * safeFrameCount), safeFrameCount - 1);
}

export function getSteppedFrameIndex(current: number, delta: number, frameCount: number) {
  if (!Number.isFinite(current) || !Number.isFinite(delta) || !Number.isFinite(frameCount)) {
    return 0;
  }

  const safeFrameCount = Math.max(0, Math.floor(frameCount));
  if (safeFrameCount === 0) {
    return 0;
  }

  const nextFrame = (Math.floor(current) + Math.trunc(delta)) % safeFrameCount;
  return nextFrame < 0 ? nextFrame + safeFrameCount : nextFrame;
}
