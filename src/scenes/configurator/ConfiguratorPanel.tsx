import {
  COLORS,
  MATERIALS,
  PARTS,
  formatPrice,
  priceOf,
  type MaterialId,
  type PartId,
  type ShoeConfig,
} from './model'

export interface ConfiguratorPanelProps {
  config: ShoeConfig
  selectedPart: PartId
  onSelectPart: (part: PartId) => void
  onColor: (part: PartId, hex: string) => void
  onMaterial: (material: MaterialId) => void
  onReset: () => void
}

/** The controls beside the 3D view. Plain HTML, so it works with keyboard and screen readers. */
export function ConfiguratorPanel({
  config,
  selectedPart,
  onSelectPart,
  onColor,
  onMaterial,
  onReset,
}: ConfiguratorPanelProps) {
  const partLabel = PARTS.find((p) => p.id === selectedPart)?.label ?? ''
  return (
    <div className="panel controls">
      <fieldset>
        <legend>1. Pick a part</legend>
        <div className="chips">
          {PARTS.map((p) => (
            <button
              key={p.id}
              type="button"
              className="chip"
              aria-pressed={selectedPart === p.id}
              onClick={() => onSelectPart(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>2. Pick a colour for: {partLabel}</legend>
        <div className="swatches">
          {COLORS.map((c) => (
            <button
              key={c.id}
              type="button"
              className="swatch"
              style={{ background: c.hex }}
              aria-label={`${c.label} for ${partLabel}`}
              aria-pressed={config.colors[selectedPart].toLowerCase() === c.hex}
              onClick={() => onColor(selectedPart, c.hex)}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend>3. Upper material</legend>
        <div className="chips">
          {MATERIALS.map((m) => (
            <button
              key={m.id}
              type="button"
              className="chip"
              aria-pressed={config.material === m.id}
              onClick={() => onMaterial(m.id)}
            >
              {m.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="price-row">
        <div>
          <span className="muted">Sample price</span>
          <strong className="price" aria-live="polite">
            {formatPrice(priceOf(config))}
          </strong>
        </div>
        <button type="button" className="btn ghost" onClick={onReset}>
          Reset
        </button>
      </div>
    </div>
  )
}
