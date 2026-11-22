import { describe, expect, it } from 'vitest'
import {
  BASE_PRICE,
  DEFAULT_CONFIG,
  MATERIALS,
  formatPrice,
  priceOf,
  setMaterial,
  setPartColor,
} from './configurator/model'
import { nearestIndex, ringLayout, unwrapTarget, wrapAngle, wrapIndex } from './gallery/layout'
import {
  GLOW_FRAGMENT,
  PALETTES,
  PLANET_FRAGMENT,
  PLANET_VERTEX,
  applyPalette,
  createUniforms,
} from './planet/shader'

describe('configurator model', () => {
  it('changes one part without touching the original', () => {
    const next = setPartColor(DEFAULT_CONFIG, 'sole', '#000000')
    expect(next.colors.sole).toBe('#000000')
    expect(next.colors.upper).toBe(DEFAULT_CONFIG.colors.upper)
    expect(DEFAULT_CONFIG.colors.sole).not.toBe('#000000')
  })
  it('prices by material and keeps colours free', () => {
    const recolored = setPartColor(DEFAULT_CONFIG, 'upper', '#123456')
    expect(priceOf(recolored)).toBe(priceOf(DEFAULT_CONFIG))
    const patent = MATERIALS.find((m) => m.id === 'patent')
    expect(priceOf(setMaterial(DEFAULT_CONFIG, 'patent'))).toBe(BASE_PRICE + (patent?.priceDelta ?? 0))
  })
  it('formats prices', () => {
    expect(formatPrice(95)).toBe('$95.00')
  })
})

describe('gallery layout', () => {
  it('puts panel 0 straight ahead and spaces the rest evenly', () => {
    const poses = ringLayout(8, 4)
    expect(poses).toHaveLength(8)
    expect(poses[0]?.position[0]).toBeCloseTo(0)
    expect(poses[0]?.position[2]).toBeCloseTo(-4)
    expect(poses[2]?.position[0]).toBeCloseTo(4)
    for (const p of poses) expect(Math.hypot(p.position[0], p.position[2])).toBeCloseTo(4)
  })
  it('turns the short way round', () => {
    expect(wrapAngle(Math.PI * 3)).toBeCloseTo(Math.PI)
    expect(unwrapTarget(0, Math.PI * 2 - 0.1)).toBeCloseTo(-0.1)
    expect(unwrapTarget(Math.PI * 2, 0.2)).toBeCloseTo(Math.PI * 2 + 0.2)
  })
  it('wraps indexes and finds the nearest panel', () => {
    expect(wrapIndex(-1, 8)).toBe(7)
    expect(wrapIndex(9, 8)).toBe(1)
    expect(nearestIndex((Math.PI * 2) / 8 + 0.05, 8)).toBe(1)
    expect(nearestIndex(-0.05, 8)).toBe(0)
  })
})

describe('planet shader', () => {
  it('declares every uniform it uses', () => {
    const uniforms = createUniforms(PALETTES.magma, 0.5)
    for (const name of Object.keys(uniforms)) {
      expect(`${PLANET_VERTEX}\n${PLANET_FRAGMENT}\n${GLOW_FRAGMENT}`).toContain(`uniform`)
      expect(`${PLANET_VERTEX}${PLANET_FRAGMENT}${GLOW_FRAGMENT}`).toContain(name)
    }
  })
  it('writes colour through three.js output chunks', () => {
    expect(PLANET_FRAGMENT).toContain('#include <colorspace_fragment>')
    expect(PLANET_FRAGMENT).toContain('gl_FragColor')
  })
  it('swaps palettes in place', () => {
    const uniforms = createUniforms(PALETTES.magma, 0.5)
    applyPalette(uniforms, PALETTES.ice)
    expect(uniforms.uLavaA.value.getHexString()).not.toBe(createUniforms(PALETTES.magma, 0).uLavaA.value.getHexString())
  })
})
