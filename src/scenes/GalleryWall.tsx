import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { Group, Mesh, MeshBasicMaterial } from 'three'
import { FitFov } from '../lib/FitFov'
import { damp } from '../lib/motion'
import { useReducedMotion } from '../lib/perf'
import { SceneCanvas } from '../lib/SceneCanvas'
import { SAMPLE_ITEMS, type GalleryItem } from './gallery/items'
import { nearestIndex, ringLayout, unwrapTarget, wrapIndex } from './gallery/layout'
import { PANEL_ASPECT, makePanelTexture } from './gallery/panelTexture'

export interface GalleryWallProps {
  items?: readonly GalleryItem[]
  /** Index of the panel facing the viewer. */
  activeIndex: number
  onActiveChange: (index: number) => void
  /** Float and idle drift. Off when the visitor prefers reduced motion. */
  animated?: boolean
  className?: string
}

const RADIUS = 4.2
const PANEL_H = 2.9

interface PanelProps {
  item: GalleryItem
  index: number
  pose: ReturnType<typeof ringLayout>[number]
  hovered: boolean
  active: boolean
  instant: boolean
  onHover: (index: number | null) => void
  onPick: (index: number) => void
}

function Panel({ item, index, pose, hovered, active, instant, onHover, onPick }: PanelProps) {
  const mesh = useRef<Mesh>(null)
  const texture = useMemo(() => makePanelTexture(item), [item])
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => () => texture.dispose(), [texture])

  const lift = hovered ? 0.55 : 0
  const targetScale = hovered ? 1.14 : 1
  const targetOpacity = hovered || active ? 1 : 0.62

  useEffect(() => {
    invalidate()
  }, [lift, targetScale, targetOpacity, invalidate])

  useFrame((_, dt) => {
    const m = mesh.current
    if (!m) return
    const mat = m.material as MeshBasicMaterial
    // Lift moves the panel toward the viewer, along the ring normal.
    const current = (m.userData.lift as number | undefined) ?? 0
    const nextLift = instant ? lift : damp(current, lift, 12, dt)
    m.userData.lift = nextLift
    const nextScale = instant ? targetScale : damp(m.scale.x, targetScale, 12, dt)
    m.scale.setScalar(nextScale)
    const nextOpacity = instant ? targetOpacity : damp(mat.opacity, targetOpacity, 10, dt)
    mat.opacity = nextOpacity
    const radius = RADIUS - nextLift
    m.position.set(Math.sin(pose.angle) * radius, 0, -Math.cos(pose.angle) * radius)
    const settled =
      Math.abs(nextLift - lift) < 0.002 &&
      Math.abs(nextScale - targetScale) < 0.002 &&
      Math.abs(nextOpacity - targetOpacity) < 0.005
    if (!settled) invalidate()
  })

  return (
    <mesh
      ref={mesh}
      position={pose.position}
      rotation={[0, pose.rotationY, 0]}
      onPointerOver={(e) => {
        e.stopPropagation()
        onHover(index)
      }}
      onPointerOut={() => onHover(null)}
      onClick={(e) => {
        e.stopPropagation()
        onPick(index)
      }}
    >
      <planeGeometry args={[PANEL_H * PANEL_ASPECT, PANEL_H]} />
      <meshBasicMaterial map={texture} transparent opacity={0.62} toneMapped={false} />
    </mesh>
  )
}

function Ring({ items, activeIndex, onActiveChange, animated }: Required<Omit<GalleryWallProps, 'className'>>) {
  const group = useRef<Group>(null)
  const reduced = useReducedMotion()
  const invalidate = useThree((s) => s.invalidate)
  const gl = useThree((s) => s.gl)
  const poses = useMemo(() => ringLayout(items.length, RADIUS), [items.length])
  const [hovered, setHovered] = useState<number | null>(null)
  const target = useRef(0)
  const current = useRef(0)
  const drag = useRef<{ x: number; start: number; moved: boolean } | null>(null)
  const count = items.length
  const instant = reduced
  const activeRef = useRef(activeIndex)
  useEffect(() => {
    activeRef.current = activeIndex
  })

  // Turn the ring so the active panel faces the viewer, the short way round.
  useEffect(() => {
    target.current = unwrapTarget(target.current, poses[wrapIndex(activeIndex, count)]?.angle ?? 0)
    invalidate()
  }, [activeIndex, poses, count, invalidate])

  // Drag to spin. On release, snap to the nearest panel.
  useEffect(() => {
    const el = gl.domElement
    const down = (e: PointerEvent) => {
      drag.current = { x: e.clientX, start: target.current, moved: false }
    }
    const move = (e: PointerEvent) => {
      const d = drag.current
      if (!d) return
      const dx = e.clientX - d.x
      if (Math.abs(dx) > 4) d.moved = true
      if (d.moved) {
        target.current = d.start - dx * 0.006
        invalidate()
      }
    }
    const up = () => {
      const d = drag.current
      drag.current = null
      if (d?.moved) {
        const idx = nearestIndex(target.current, count)
        if (idx === wrapIndex(activeRef.current, count)) {
          target.current = unwrapTarget(target.current, poses[idx]?.angle ?? 0)
          invalidate()
        } else onActiveChange(idx)
      }
    }
    el.addEventListener('pointerdown', down)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerup', up)
    return () => {
      el.removeEventListener('pointerdown', down)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [gl, invalidate, count, poses, onActiveChange])

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    current.current = instant ? target.current : damp(current.current, target.current, 6, dt)
    g.rotation.y = current.current
    g.position.y = animated && !reduced ? Math.sin(state.clock.elapsedTime * 0.8) * 0.06 : 0
    if (Math.abs(current.current - target.current) > 0.001) invalidate()
  })

  return (
    <group ref={group}>
      <FitFov base={50} minAspect={1.5} />
      {items.map((item, i) => {
        const pose = poses[i]
        if (!pose) return null
        return (
          <Panel
            key={item.id}
            item={item}
            index={i}
            pose={pose}
            hovered={hovered === i}
            active={wrapIndex(activeIndex, count) === i}
            instant={instant}
            onHover={setHovered}
            onPick={(idx) => onActiveChange(idx)}
          />
        )
      })}
    </group>
  )
}

/** Panels arranged around the viewer. Hover lifts one, click or drag turns the ring. */
export default function GalleryWall({
  items = SAMPLE_ITEMS,
  activeIndex,
  onActiveChange,
  animated = true,
  className,
}: GalleryWallProps) {
  return (
    <SceneCanvas
      label="Ring of floating project panels. Hover to focus one, drag or click to turn the ring."
      animated={animated}
      camera={{ position: [0, 0, 0.01], fov: 50 }}
      className={className}
    >
      <Ring items={items} activeIndex={activeIndex} onActiveChange={onActiveChange} animated={animated} />
    </SceneCanvas>
  )
}
