import { useEffect, useState, type RefObject } from 'react'

export type Frameloop = 'always' | 'demand' | 'never'

interface FrameloopInput {
  /** Canvas is on screen and the tab is in front. */
  visible: boolean
  reducedMotion: boolean
  /** The scene has idle animation (spin, float, flow). */
  animated: boolean
}

/**
 * Picks the render loop for a scene.
 * Offscreen or hidden tab: stop. Reduced motion or nothing animating: draw only when something changes.
 */
export function pickFrameloop({ visible, reducedMotion, animated }: FrameloopInput): Frameloop {
  if (!visible) return 'never'
  if (reducedMotion || !animated) return 'demand'
  return 'always'
}

/** Maps the monitor's 0..1 performance factor to a pixel ratio between min and max, in 0.25 steps. */
export function dprFromFactor(factor: number, min: number, max: number): number {
  const f = Math.min(1, Math.max(0, factor))
  const raw = min + (max - min) * f
  return Math.round(raw * 4) / 4
}

export function webglAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas')
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
  } catch {
    return false
  }
}

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && typeof window.matchMedia === 'function'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false,
  )
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return
    const query = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(query.matches)
    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])
  return reduced
}

export function useInView(ref: RefObject<Element | null>): boolean {
  const [inView, setInView] = useState(true)
  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setInView(entry?.isIntersecting ?? true), {
      rootMargin: '80px',
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
  return inView
}

export function usePageVisible(): boolean {
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || !document.hidden)
  useEffect(() => {
    const onChange = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])
  return visible
}
