import { describe, expect, it } from 'vitest'
import { clamp01, fitFov, sampleKeyframes, stepIndex, trackProgress } from './motion'
import { dprFromFactor, pickFrameloop } from './perf'
import { hrefFor, parseHash } from './router'

describe('pickFrameloop', () => {
  it('stops drawing when offscreen or in a background tab', () => {
    expect(pickFrameloop({ visible: false, reducedMotion: false, animated: true })).toBe('never')
  })
  it('draws only on change for reduced motion', () => {
    expect(pickFrameloop({ visible: true, reducedMotion: true, animated: true })).toBe('demand')
  })
  it('draws only on change for scenes with no idle animation', () => {
    expect(pickFrameloop({ visible: true, reducedMotion: false, animated: false })).toBe('demand')
  })
  it('runs continuously for visible animated scenes', () => {
    expect(pickFrameloop({ visible: true, reducedMotion: false, animated: true })).toBe('always')
  })
})

describe('dprFromFactor', () => {
  it('maps the factor into the range in quarter steps', () => {
    expect(dprFromFactor(0, 0.75, 2)).toBe(0.75)
    expect(dprFromFactor(1, 0.75, 2)).toBe(2)
    expect(dprFromFactor(0.5, 1, 2)).toBe(1.5)
  })
  it('clamps out-of-range factors', () => {
    expect(dprFromFactor(-3, 1, 2)).toBe(1)
    expect(dprFromFactor(9, 1, 2)).toBe(2)
  })
})

describe('motion helpers', () => {
  it('clamps to 0..1', () => {
    expect(clamp01(-1)).toBe(0)
    expect(clamp01(2)).toBe(1)
  })
  it('samples keyframes at the ends and the middle', () => {
    const keys = [
      [0, 0, 0],
      [10, 0, 0],
      [10, 10, 0],
    ] as const
    expect(sampleKeyframes(keys, 0)).toEqual([0, 0, 0])
    expect(sampleKeyframes(keys, 1)).toEqual([10, 10, 0])
    expect(sampleKeyframes(keys, 0.5)).toEqual([10, 0, 0])
  })
  it('widens the camera only on narrow screens', () => {
    expect(fitFov(40, 1.6, 1.3)).toBe(40)
    expect(fitFov(40, 0.5, 1.3)).toBeGreaterThan(40)
    expect(fitFov(40, 0.1, 1.3)).toBeLessThanOrEqual(100)
  })
  it('finds the active step', () => {
    expect(stepIndex(0, 4)).toBe(0)
    expect(stepIndex(0.3, 4)).toBe(1)
    expect(stepIndex(1, 4)).toBe(3)
  })
  it('computes how far a tall track has scrolled', () => {
    expect(trackProgress(0, 2000, 800)).toBe(0)
    expect(trackProgress(-600, 2000, 800)).toBe(0.5)
    expect(trackProgress(-5000, 2000, 800)).toBe(1)
    expect(trackProgress(0, 500, 800)).toBe(0)
  })
})

describe('router', () => {
  it('parses known routes and falls back to home', () => {
    expect(parseHash('#/gallery')).toBe('gallery')
    expect(parseHash('#planet')).toBe('planet')
    expect(parseHash('#/nope')).toBe('home')
    expect(parseHash('')).toBe('home')
  })
  it('builds hrefs', () => {
    expect(hrefFor('home')).toBe('#/')
    expect(hrefFor('hero')).toBe('#/hero')
  })
})
