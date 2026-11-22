import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import App from './App'
import { SceneCanvas } from './lib/SceneCanvas'
import { ConfiguratorPanel } from './scenes/configurator/ConfiguratorPanel'
import { DEFAULT_CONFIG } from './scenes/configurator/model'

beforeAll(() => {
  // jsdom has no WebGL or 2D context; null makes the app take its fallback path quietly.
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
})

afterEach(() => {
  cleanup()
  window.location.hash = ''
})

describe('ConfiguratorPanel', () => {
  const setup = () => {
    const handlers = {
      onSelectPart: vi.fn(),
      onColor: vi.fn(),
      onMaterial: vi.fn(),
      onReset: vi.fn(),
    }
    render(<ConfiguratorPanel config={DEFAULT_CONFIG} selectedPart="sole" {...handlers} />)
    return handlers
  }

  it('sends the chosen colour for the selected part', () => {
    const h = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Brick for Sole' }))
    expect(h.onColor).toHaveBeenCalledWith('sole', '#b5432a')
  })
  it('selects parts and materials', () => {
    const h = setup()
    fireEvent.click(screen.getByRole('button', { name: 'Laces' }))
    fireEvent.click(screen.getByRole('button', { name: 'Suede' }))
    expect(h.onSelectPart).toHaveBeenCalledWith('laces')
    expect(h.onMaterial).toHaveBeenCalledWith('suede')
  })
  it('shows the sample price and a reset button', () => {
    const h = setup()
    expect(screen.getByText('$115.00')).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Reset' }))
    expect(h.onReset).toHaveBeenCalled()
  })
})

describe('SceneCanvas', () => {
  it('shows a text fallback when WebGL is not available', () => {
    render(
      <SceneCanvas label="Test scene">
        <group />
      </SceneCanvas>,
    )
    expect(screen.getByRole('img', { name: 'Test scene' })).toBeTruthy()
    expect(screen.getByText(/needs WebGL/)).toBeTruthy()
  })
})

describe('App routing', () => {
  it('starts on the overview with four scene cards', () => {
    render(<App />)
    expect(screen.getAllByRole('link', { name: /Good for|Visitors|A 3D|Panels|A glowing/ }).length).toBe(4)
  })
  it('loads a scene page lazily from the hash', async () => {
    window.location.hash = '#/configurator'
    render(<App />)
    expect(await screen.findByRole('heading', { name: 'Product configurator' }, { timeout: 8000 })).toBeTruthy()
    expect(screen.getByRole('link', { name: 'Configurator' }).getAttribute('aria-current')).toBe('page')
  })
})
