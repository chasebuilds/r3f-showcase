import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'

/** Asks an on-demand canvas to draw one frame whenever `on` changes. */
export function Redraw({ on }: { on: unknown }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    invalidate()
  }, [on, invalidate])
  return null
}
