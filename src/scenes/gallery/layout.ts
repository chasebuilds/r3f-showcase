export interface PanelPose {
  position: [number, number, number]
  /** Rotation around Y so the panel faces the viewer at the centre. */
  rotationY: number
  /** Angle of the panel around the ring, in radians. 0 is straight ahead. */
  angle: number
}

/** Places `count` panels evenly on a ring around the origin. Panel 0 is straight ahead (-Z). */
export function ringLayout(count: number, radius: number): PanelPose[] {
  return Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2
    return {
      position: [Math.sin(angle) * radius, 0, -Math.cos(angle) * radius],
      rotationY: -angle,
      angle,
    }
  })
}

const TAU = Math.PI * 2

/** Wraps an angle into (-PI, PI]. */
export function wrapAngle(a: number): number {
  const r = ((((a + Math.PI) % TAU) + TAU) % TAU) - Math.PI
  return r === -Math.PI ? Math.PI : r
}

/** Closest equivalent of `desired` to `current`, so the ring turns the short way round. */
export function unwrapTarget(current: number, desired: number): number {
  return current + wrapAngle(desired - current)
}

export function wrapIndex(i: number, count: number): number {
  return ((i % count) + count) % count
}

/** Which panel is nearest the front for a given ring rotation. */
export function nearestIndex(rotation: number, count: number): number {
  return wrapIndex(Math.round((rotation / TAU) * count), count)
}
