import { useState } from 'react'
import { PageHead, UseIt } from '../components/PageHead'
import LavaPlanet from '../scenes/LavaPlanet'
import { PALETTES, type PaletteId } from '../scenes/planet/shader'

const CODE = `import LavaPlanet from './scenes/LavaPlanet'

<LavaPlanet heat={0.7} speed={1} palette="magma" />`

export default function PlanetPage() {
  const [heat, setHeat] = useState(0.7)
  const [speed, setSpeed] = useState(1)
  const [palette, setPalette] = useState<PaletteId>('magma')
  return (
    <>
      <PageHead
        title="Shader planet"
        lead="The surface is drawn per pixel by a custom GLSL shader: layered noise for rock, thin bright cracks, and a glow at the edge. Drag to turn the planet."
      />
      <div className="split">
        <LavaPlanet heat={heat} speed={speed} palette={palette} />
        <div className="panel controls">
          <label className="slider">
            <span>Heat</span>
            <input type="range" min={0} max={1} step={0.01} value={heat} onChange={(e) => setHeat(Number(e.target.value))} />
          </label>
          <label className="slider">
            <span>Flow speed</span>
            <input type="range" min={0} max={2} step={0.05} value={speed} onChange={(e) => setSpeed(Number(e.target.value))} />
          </label>
          <fieldset>
            <legend>Colour</legend>
            <div className="chips">
              {(Object.keys(PALETTES) as PaletteId[]).map((id) => (
                <button key={id} type="button" className="chip" aria-pressed={palette === id} onClick={() => setPalette(id)}>
                  {PALETTES[id].label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>
      </div>
      <UseIt code={CODE} />
    </>
  )
}
