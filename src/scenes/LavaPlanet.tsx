import { OrbitControls, Stars } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useEffect, useMemo, useRef } from 'react'
import { AdditiveBlending, BackSide, type Group, type ShaderMaterial } from 'three'
import { FitFov } from '../lib/FitFov'
import { Redraw } from '../lib/Redraw'
import { SceneCanvas } from '../lib/SceneCanvas'
import { useReducedMotion } from '../lib/perf'
import {
  GLOW_FRAGMENT,
  GLOW_VERTEX,
  PALETTES,
  PLANET_FRAGMENT,
  PLANET_VERTEX,
  applyPalette,
  createUniforms,
  type PaletteId,
  type PlanetUniforms,
} from './planet/shader'

export interface LavaPlanetProps {
  /** 0 (cooling crust) to 1 (cracked and glowing). */
  heat?: number
  /** Flow speed multiplier, 0 to 2. */
  speed?: number
  palette?: PaletteId
  /** Spin and flow on their own. Off when the visitor prefers reduced motion. */
  animated?: boolean
  className?: string
}

/** Moves the flow and spin forward. Kept outside the component because it mutates three.js objects. */
function advance(material: ShaderMaterial | null, group: Group | null, step: number): void {
  if (material) (material.uniforms as PlanetUniforms).uTime.value += step
  if (group) group.rotation.y += step * 0.12
}

function Planet({ heat, speed, palette, animated }: Required<Omit<LavaPlanetProps, 'className'>>) {
  const group = useRef<Group>(null)
  const material = useRef<ShaderMaterial>(null)
  const reduced = useReducedMotion()
  const uniforms = useMemo(() => createUniforms(PALETTES.magma, 0.7), [])
  const glowUniforms = useMemo(() => ({ uRim: uniforms.uRim, uHeat: uniforms.uHeat }), [uniforms])
  const running = animated && !reduced

  useEffect(() => {
    const u = material.current?.uniforms as PlanetUniforms | undefined
    if (!u) return
    u.uHeat.value = heat
    applyPalette(u, PALETTES[palette])
  }, [heat, palette])

  useFrame((_, dt) => {
    if (running) advance(material.current, group.current, dt * speed)
  })

  return (
    <>
      <group ref={group}>
        <mesh>
          <sphereGeometry args={[1.6, 160, 160]} />
          <shaderMaterial ref={material} uniforms={uniforms} vertexShader={PLANET_VERTEX} fragmentShader={PLANET_FRAGMENT} />
        </mesh>
      </group>
      <mesh scale={1.18}>
        <sphereGeometry args={[1.6, 48, 48]} />
        <shaderMaterial
          uniforms={glowUniforms}
          vertexShader={GLOW_VERTEX}
          fragmentShader={GLOW_FRAGMENT}
          side={BackSide}
          transparent
          depthWrite={false}
          blending={AdditiveBlending}
        />
      </mesh>
      <FitFov base={40} minAspect={1.0} />
      <Stars radius={40} depth={20} count={900} factor={3} fade speed={0} />
      <OrbitControls enablePan={false} enableZoom={false} minPolarAngle={Math.PI / 3} maxPolarAngle={(2 * Math.PI) / 3} />
      <Redraw on={heat} />
      <Redraw on={palette} />
    </>
  )
}

/** Lava planet drawn by a custom GLSL shader (own noise, cracks, rim glow). */
export default function LavaPlanet({
  heat = 0.7,
  speed = 1,
  palette = 'magma',
  animated = true,
  className,
}: LavaPlanetProps) {
  return (
    <SceneCanvas
      label="A glowing lava planet. Drag to turn it."
      animated={animated}
      camera={{ position: [0, 0, 5.4], fov: 40 }}
      className={className}
    >
      <Planet heat={heat} speed={speed} palette={palette} animated={animated} />
    </SceneCanvas>
  )
}
