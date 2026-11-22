export type Vec3 = readonly [number, number, number]

export const clamp01 = (t: number): number => Math.min(1, Math.max(0, t))

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t

/** Smooth 0..1 ease, used so scroll-driven moves do not stop abruptly. */
export const smoothstep = (t: number): number => {
  const x = clamp01(t)
  return x * x * (3 - 2 * x)
}

/** Interpolates between evenly spaced keyframes. t is 0..1 across the whole list. */
export function sampleKeyframes(keys: readonly Vec3[], t: number): [number, number, number] {
  const first = keys[0] ?? [0, 0, 0]
  if (keys.length < 2) return [first[0], first[1], first[2]]
  const scaled = clamp01(t) * (keys.length - 1)
  const i = Math.min(keys.length - 2, Math.floor(scaled))
  const local = smoothstep(scaled - i)
  const a = keys[i] ?? first
  const b = keys[i + 1] ?? first
  return [lerp(a[0], b[0], local), lerp(a[1], b[1], local), lerp(a[2], b[2], local)]
}

/** Which of `count` equal steps the 0..1 progress is inside. */
export function stepIndex(progress: number, count: number): number {
  return Math.min(count - 1, Math.floor(clamp01(progress) * count))
}

/** Moves a value toward a target; frame-rate independent. */
export function damp(current: number, target: number, rate: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-rate * dt))
}

/** 0..1 progress of `track` through the viewport. 0 when its top reaches the top, 1 when its bottom reaches the bottom. */
export function trackProgress(top: number, height: number, viewport: number): number {
  const span = height - viewport
  return span <= 0 ? 0 : clamp01(-top / span)
}

/**
 * Vertical field of view (degrees) that keeps a scene framed on narrow screens.
 * `baseFov` is right at `minAspect` or wider; below that the view widens so the sides are not cut off.
 */
export function fitFov(baseFov: number, aspect: number, minAspect: number): number {
  if (aspect >= minAspect || aspect <= 0) return baseFov
  const half = Math.tan((baseFov * Math.PI) / 360) * (minAspect / aspect)
  return Math.min(100, (Math.atan(half) * 360) / Math.PI)
}
