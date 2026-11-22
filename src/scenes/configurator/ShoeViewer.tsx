import { ContactShadows, Environment, Lightformer, OrbitControls, RoundedBox } from '@react-three/drei'
import type { ThreeEvent } from '@react-three/fiber'
import { useReducedMotion } from '../../lib/perf'
import { FitFov } from '../../lib/FitFov'
import { Redraw } from '../../lib/Redraw'
import { SceneCanvas } from '../../lib/SceneCanvas'
import { materialOf, type PartId, type ShoeConfig } from './model'

export interface ShoeViewerProps {
  config: ShoeConfig
  /** Slow turntable spin. Off when the visitor prefers reduced motion. */
  animated?: boolean
  /** Called when the visitor clicks a part of the shoe. */
  onPartClick?: (part: PartId) => void
  /** Part to light up slightly so the visitor sees what they are editing. */
  selectedPart?: PartId
  className?: string
}

const LACE_XS = [-0.05, 0.22, 0.49, 0.76]

function domeY(x: number): number {
  const t = (x + 0.05) / 1.45
  return 0.13 + 0.7 * Math.sqrt(Math.max(0, 1 - t * t))
}

function ShoeModel({ config, onPartClick, selectedPart }: Omit<ShoeViewerProps, 'animated' | 'className'>) {
  const material = materialOf(config.material)
  const glow = (part: PartId) => (selectedPart === part ? 0.22 : 0)
  const pick = (part: PartId) => (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation()
    onPartClick?.(part)
  }
  const hover = {
    onPointerOver: () => {
      document.body.style.cursor = 'pointer'
    },
    onPointerOut: () => {
      document.body.style.cursor = ''
    },
  }

  return (
    <group position={[0, -0.35, 0]}>
      {/* sole */}
      <RoundedBox args={[3.0, 0.3, 1.12]} radius={0.12} smoothness={4} position={[0, 0, 0]} onClick={pick('sole')} {...hover}>
        <meshStandardMaterial color={config.colors.sole} roughness={0.7} emissive={config.colors.sole} emissiveIntensity={glow('sole')} />
      </RoundedBox>
      {/* upper: half dome stretched into a shoe body */}
      <mesh position={[-0.05, 0.13, 0]} scale={[1.45, 0.7, 0.56]} onClick={pick('upper')} {...hover}>
        <sphereGeometry args={[1, 48, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color={config.colors.upper}
          roughness={material.roughness}
          clearcoat={material.clearcoat}
          clearcoatRoughness={0.2}
          sheen={material.sheen}
          sheenColor="#ffffff"
          emissive={config.colors.upper}
          emissiveIntensity={glow('upper')}
        />
      </mesh>
      {/* toe cap */}
      <mesh position={[1.0, 0.14, 0]} scale={[0.55, 0.36, 0.5]} onClick={pick('toe')} {...hover}>
        <sphereGeometry args={[1, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial
          color={config.colors.toe}
          roughness={material.roughness}
          clearcoat={material.clearcoat}
          emissive={config.colors.toe}
          emissiveIntensity={glow('toe')}
        />
      </mesh>
      {/* ankle collar and opening */}
      <mesh position={[-1.0, 0.58, 0]} scale={[1, 1, 1.15]}>
        <cylinderGeometry args={[0.34, 0.4, 0.5, 32]} />
        <meshStandardMaterial color={config.colors.upper} roughness={0.9} />
      </mesh>
      <mesh position={[-1.0, 0.84, 0]} scale={[1, 1, 1.15]}>
        <cylinderGeometry args={[0.3, 0.3, 0.02, 32]} />
        <meshStandardMaterial color="#15101a" roughness={1} />
      </mesh>
      {/* tongue */}
      <RoundedBox args={[0.7, 0.07, 0.5]} radius={0.03} position={[-0.35, 0.82, 0]} rotation={[0, 0, 0.55]} onClick={pick('upper')} {...hover}>
        <meshStandardMaterial color={config.colors.upper} roughness={0.9} />
      </RoundedBox>
      {/* laces */}
      {LACE_XS.map((x) => (
        <mesh
          key={x}
          position={[x, domeY(x) - 0.01, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          onClick={pick('laces')}
          {...hover}
        >
          <cylinderGeometry args={[0.04, 0.04, 0.5, 12]} />
          <meshStandardMaterial color={config.colors.laces} roughness={0.85} emissive={config.colors.laces} emissiveIntensity={glow('laces')} />
        </mesh>
      ))}
      {/* side stripes, one per side */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[-0.1, 0.45, side * 0.485]}
          rotation={[0, 0, 0.28]}
          onClick={pick('stripe')}
          {...hover}
        >
          <boxGeometry args={[1.0, 0.1, 0.05]} />
          <meshStandardMaterial color={config.colors.stripe} roughness={0.5} emissive={config.colors.stripe} emissiveIntensity={glow('stripe')} />
        </mesh>
      ))}
    </group>
  )
}

function Rig({ animated }: { animated: boolean }) {
  const reduced = useReducedMotion()
  return (
    <>
      <OrbitControls
        makeDefault
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.05}
        autoRotate={animated && !reduced}
        autoRotateSpeed={1.4}
      />
      <ambientLight intensity={0.35} />
      <directionalLight position={[4, 6, 3]} intensity={1.6} />
      <Environment resolution={64}>
        <Lightformer form="rect" intensity={2.2} position={[0, 4, 2]} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} position={[-5, 1, -2]} scale={[3, 4, 1]} color="#ffd9b0" />
        <Lightformer form="rect" intensity={0.8} position={[5, 0, 3]} scale={[3, 4, 1]} color="#b8d4ff" />
      </Environment>
      <ContactShadows position={[0, -0.5, 0]} opacity={0.55} scale={9} blur={2.6} far={2.5} resolution={512} frames={1} />
    </>
  )
}

/** 3D sneaker built from primitives. Fully controlled by `config`. */
export function ShoeViewer({ config, animated = true, onPartClick, selectedPart, className }: ShoeViewerProps) {
  return (
    <SceneCanvas
      label="3D sneaker. Drag to turn it, click a part to select it."
      animated={animated}
      camera={{ position: [3.6, 1.9, 4.2], fov: 32 }}
      className={className}
    >
      <FitFov base={32} minAspect={1.0} />
      <Rig animated={animated} />
      <ShoeModel config={config} onPartClick={onPartClick} selectedPart={selectedPart} />
      <Redraw on={config} />
      <Redraw on={selectedPart} />
    </SceneCanvas>
  )
}
