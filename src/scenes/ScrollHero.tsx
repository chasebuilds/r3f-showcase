import { Environment, Lightformer } from '@react-three/drei'
import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type RefObject } from 'react'
import { Color, Object3D, type Group, type InstancedMesh, type MeshPhysicalMaterial } from 'three'
import { FitFov } from '../lib/FitFov'
import { damp, sampleKeyframes, stepIndex, trackProgress, type Vec3 } from '../lib/motion'
import { useReducedMotion } from '../lib/perf'
import { SceneCanvas } from '../lib/SceneCanvas'

export interface HeroStep {
  title: string
  body: string
}

export interface ScrollHeroProps {
  steps?: readonly HeroStep[]
  /** One colour per step. The 3D object blends between them as you scroll. */
  colors?: readonly string[]
  animated?: boolean
  className?: string
}

const DEFAULT_STEPS: readonly HeroStep[] = [
  { title: 'Show your product from every side', body: 'A 3D object turns as the visitor scrolls. No video file, no plugin.' },
  { title: 'Let the page tell the story', body: 'Each section moves the camera and changes the colour. One scroll, one idea at a time.' },
  { title: 'Stay quick on a phone', body: 'The scene pauses when it is off screen and lowers its sharpness if the device struggles.' },
  { title: 'Respect people who want less motion', body: 'With reduced motion on, the object still follows the scroll but never drifts on its own.' },
]

const DEFAULT_COLORS = ['#ff7a3d', '#e0457b', '#5f9fd1', '#8fc98a'] as const

const CAMERA_PATH: readonly Vec3[] = [
  [0, 0.4, 7.5],
  [4.6, 1.2, 5.2],
  [-4.2, -0.6, 4.6],
  [0, 2.4, 9.5],
]

function readProgress(el: HTMLElement | null): number {
  if (!el) return 0
  const r = el.getBoundingClientRect()
  return trackProgress(r.top, r.height, window.innerHeight)
}

const SHARD_COUNT = 56

function HeroScene({
  trackRef,
  colors,
  animated,
}: {
  trackRef: RefObject<HTMLElement | null>
  colors: readonly string[]
  animated: boolean
}) {
  const reduced = useReducedMotion()
  const invalidate = useThree((s) => s.invalidate)
  const knot = useRef<Group>(null)
  const shards = useRef<InstancedMesh>(null)
  const material = useRef<MeshPhysicalMaterial>(null)
  const target = useRef(0)
  const shown = useRef(0)
  const palette = useMemo(() => colors.map((c) => new Color(c)), [colors])
  const scratch = useMemo(() => new Color(), [])
  const running = animated && !reduced

  useEffect(() => {
    const onScroll = () => {
      target.current = readProgress(trackRef.current)
      invalidate()
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [trackRef, invalidate])

  useLayoutEffect(() => {
    const mesh = shards.current
    if (!mesh) return
    const dummy = new Object3D()
    for (let i = 0; i < SHARD_COUNT; i++) {
      const a = (i / SHARD_COUNT) * Math.PI * 2 * 3
      const radius = 3.1 + (i % 7) * 0.28
      dummy.position.set(Math.cos(a) * radius, Math.sin(i * 12.9898) * 1.9, Math.sin(a) * radius)
      dummy.rotation.set(i * 0.7, i * 1.3, 0)
      dummy.scale.setScalar(0.06 + (i % 5) * 0.03)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }
    mesh.instanceMatrix.needsUpdate = true
  }, [])

  useFrame((state, dt) => {
    shown.current = reduced ? target.current : damp(shown.current, target.current, 5, dt)
    const p = shown.current
    const [x, y, z] = sampleKeyframes(CAMERA_PATH, p)
    state.camera.position.set(x, y, z)
    state.camera.lookAt(0, 0, 0)

    const idle = running ? state.clock.elapsedTime : 0
    if (knot.current) {
      knot.current.rotation.y = p * Math.PI * 3 + idle * 0.25
      knot.current.rotation.x = 0.3 + p * 1.2
      knot.current.position.y = Math.sin(idle * 0.9) * 0.12
      knot.current.scale.setScalar(1 + Math.sin(p * Math.PI) * 0.25)
    }
    if (shards.current) shards.current.rotation.y = -p * Math.PI * 1.5 + idle * 0.08

    const scaled = p * (palette.length - 1)
    const i = Math.min(palette.length - 2, Math.floor(scaled))
    const a = palette[i]
    const b = palette[i + 1]
    if (material.current && a && b) material.current.color.copy(scratch.copy(a).lerp(b, scaled - i))

    if (Math.abs(shown.current - target.current) > 0.0005 || running) invalidate()
  })

  return (
    <>
      <FitFov base={40} minAspect={1.3} />
      <ambientLight intensity={0.3} />
      <directionalLight position={[5, 5, 5]} intensity={1.4} />
      <Environment resolution={64}>
        <Lightformer form="rect" intensity={2.4} position={[0, 5, 2]} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[-6, 0, 2]} scale={[3, 6, 1]} color="#ffd0a8" />
        <Lightformer form="rect" intensity={1.0} position={[6, -1, -2]} scale={[3, 6, 1]} color="#a8c8ff" />
      </Environment>
      <group ref={knot}>
        <mesh>
          <torusKnotGeometry args={[1, 0.34, 200, 28]} />
          <meshPhysicalMaterial ref={material} color={colors[0] ?? '#ff7a3d'} metalness={0.85} roughness={0.22} clearcoat={0.6} />
        </mesh>
      </group>
      <instancedMesh ref={shards} args={[undefined, undefined, SHARD_COUNT]}>
        <octahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#f4ead9" roughness={0.4} metalness={0.2} />
      </instancedMesh>
    </>
  )
}

/**
 * Landing hero that reacts to scroll. The 3D view sticks to the screen while the
 * page scrolls past; scroll position drives camera, spin and colour.
 */
export default function ScrollHero({
  steps = DEFAULT_STEPS,
  colors = DEFAULT_COLORS,
  animated = true,
  className,
}: ScrollHeroProps) {
  const trackRef = useRef<HTMLElement>(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const onScroll = () => setStep(stepIndex(readProgress(trackRef.current), steps.length))
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [steps.length])

  const current = steps[step]
  return (
    <section
      ref={trackRef}
      className={`hero-track ${className ?? ''}`}
      style={{ height: `${steps.length * 85 + 100}vh` }}
      aria-label="Scroll-driven 3D landing hero"
    >
      <div className="hero-sticky">
        <SceneCanvas
          label="A 3D knot that turns and changes colour as you scroll."
          animated={animated}
          camera={{ position: [0, 0.4, 7.5], fov: 40 }}
          className="hero-stage"
        >
          <HeroScene trackRef={trackRef} colors={colors} animated={animated} />
        </SceneCanvas>
        <div className="hero-copy panel" aria-live="polite">
          <span className="muted">
            {step + 1} / {steps.length}
          </span>
          <h2>{current?.title}</h2>
          <p>{current?.body}</p>
        </div>
        <div className="hero-hint" aria-hidden="true">
          Scroll
        </div>
      </div>
    </section>
  )
}
