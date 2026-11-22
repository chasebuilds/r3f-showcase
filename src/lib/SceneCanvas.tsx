import { Canvas } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { useMemo, useRef, useState, type ReactNode } from 'react'
import {
  dprFromFactor,
  pickFrameloop,
  useInView,
  usePageVisible,
  useReducedMotion,
  webglAvailable,
} from './perf'
import { Redraw } from './Redraw'

export interface SceneCanvasProps {
  /** Short description for screen readers. */
  label: string
  children: ReactNode
  /** True when the scene moves on its own. Static scenes only draw on change. */
  animated?: boolean
  camera?: { position: [number, number, number]; fov?: number }
  /** Pixel ratio bounds. The monitor moves between them based on measured frame rate. */
  minDpr?: number
  maxDpr?: number
  className?: string
}

/**
 * Shared canvas wrapper that applies the performance budget:
 * adaptive pixel ratio, paused when offscreen or in a background tab,
 * draw-on-change when the visitor prefers reduced motion, and a text fallback without WebGL.
 */
export function SceneCanvas({
  label,
  children,
  animated = true,
  camera = { position: [0, 0, 6], fov: 45 },
  minDpr = 0.75,
  maxDpr = 2,
  className,
}: SceneCanvasProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const inView = useInView(wrapRef)
  const pageVisible = usePageVisible()
  const reducedMotion = useReducedMotion()
  const supported = useMemo(() => webglAvailable(), [])
  const [factorDpr, setFactorDpr] = useState(Math.min(maxDpr, 1.25))

  const frameloop = pickFrameloop({ visible: inView && pageVisible, reducedMotion, animated })
  const deviceDpr = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1
  const dpr = Math.min(factorDpr, deviceDpr)

  if (!supported) {
    return (
      <div ref={wrapRef} className={`stage stage-fallback ${className ?? ''}`} role="img" aria-label={label}>
        <p>This device cannot show 3D graphics. The scene needs WebGL.</p>
      </div>
    )
  }

  const mode =
    frameloop === 'always' ? 'Live' : frameloop === 'demand' ? 'Draws on change' : 'Paused offscreen'

  return (
    <div ref={wrapRef} className={`stage ${className ?? ''}`} data-frameloop={frameloop} data-dpr={dpr}>
      <Canvas
        aria-label={label}
        role="img"
        frameloop={frameloop}
        dpr={dpr}
        camera={camera}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <PerformanceMonitor onChange={({ factor }) => setFactorDpr(dprFromFactor(factor, minDpr, maxDpr))} />
        <Redraw on={frameloop} />
        {children}
      </Canvas>
      <p className="stage-badge" role="status">
        {reducedMotion && animated ? 'Reduced motion on, animation paused. ' : ''}
        {mode}, pixel ratio {dpr}
      </p>
    </div>
  )
}
