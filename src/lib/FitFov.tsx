import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import type { PerspectiveCamera } from 'three'
import { fitFov } from './motion'

function applyFov(camera: PerspectiveCamera, fov: number): void {
  camera.fov = fov
  camera.updateProjectionMatrix()
}

/** Widens the camera on portrait screens so the whole scene stays in frame. */
export function FitFov({ base, minAspect }: { base: number; minAspect: number }) {
  const camera = useThree((s) => s.camera) as PerspectiveCamera
  const aspect = useThree((s) => s.size.width / Math.max(1, s.size.height))
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    applyFov(camera, fitFov(base, aspect, minAspect))
    invalidate()
  }, [camera, aspect, base, minAspect, invalidate])
  return null
}
