import { useState } from 'react'
import { ConfiguratorPanel } from './configurator/ConfiguratorPanel'
import {
  DEFAULT_CONFIG,
  setMaterial,
  setPartColor,
  type PartId,
  type ShoeConfig,
} from './configurator/model'
import { ShoeViewer } from './configurator/ShoeViewer'

export interface ProductConfiguratorProps {
  initialConfig?: ShoeConfig
  /** Fires on every change, for example to send the choice to a cart. */
  onChange?: (config: ShoeConfig) => void
  animated?: boolean
}

/** Product configurator: 3D shoe plus part, colour and material controls. */
export default function ProductConfigurator({
  initialConfig = DEFAULT_CONFIG,
  onChange,
  animated = true,
}: ProductConfiguratorProps) {
  const [config, setConfig] = useState<ShoeConfig>(initialConfig)
  const [selectedPart, setSelectedPart] = useState<PartId>('upper')

  const update = (next: ShoeConfig) => {
    setConfig(next)
    onChange?.(next)
  }

  return (
    <div className="split">
      <ShoeViewer config={config} animated={animated} selectedPart={selectedPart} onPartClick={setSelectedPart} />
      <ConfiguratorPanel
        config={config}
        selectedPart={selectedPart}
        onSelectPart={setSelectedPart}
        onColor={(part, hex) => update(setPartColor(config, part, hex))}
        onMaterial={(m) => update(setMaterial(config, m))}
        onReset={() => update(initialConfig)}
      />
    </div>
  )
}
