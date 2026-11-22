export type PartId = 'upper' | 'toe' | 'laces' | 'stripe' | 'sole'
export type MaterialId = 'leather' | 'canvas' | 'suede' | 'patent'

export interface ColorOption {
  id: string
  label: string
  hex: string
}

export interface MaterialOption {
  id: MaterialId
  label: string
  roughness: number
  clearcoat: number
  sheen: number
  /** Sample price change in dollars. */
  priceDelta: number
}

export interface ShoeConfig {
  colors: Record<PartId, string>
  /** Material of the upper (the main body). */
  material: MaterialId
}

export const PARTS: readonly { id: PartId; label: string }[] = [
  { id: 'upper', label: 'Upper' },
  { id: 'toe', label: 'Toe cap' },
  { id: 'laces', label: 'Laces' },
  { id: 'stripe', label: 'Side stripe' },
  { id: 'sole', label: 'Sole' },
]

export const COLORS: readonly ColorOption[] = [
  { id: 'bone', label: 'Bone', hex: '#ece4d6' },
  { id: 'ink', label: 'Ink', hex: '#1d2230' },
  { id: 'brick', label: 'Brick', hex: '#b5432a' },
  { id: 'sun', label: 'Sun', hex: '#f2a20c' },
  { id: 'moss', label: 'Moss', hex: '#4c6b45' },
  { id: 'sky', label: 'Sky', hex: '#5f9fd1' },
  { id: 'rose', label: 'Rose', hex: '#d9788f' },
  { id: 'plum', label: 'Plum', hex: '#5b2f55' },
]

export const MATERIALS: readonly MaterialOption[] = [
  { id: 'leather', label: 'Leather', roughness: 0.45, clearcoat: 0.35, sheen: 0, priceDelta: 20 },
  { id: 'canvas', label: 'Canvas', roughness: 0.95, clearcoat: 0, sheen: 0, priceDelta: 0 },
  { id: 'suede', label: 'Suede', roughness: 1, clearcoat: 0, sheen: 1, priceDelta: 15 },
  { id: 'patent', label: 'Patent', roughness: 0.12, clearcoat: 1, sheen: 0, priceDelta: 35 },
]

export const BASE_PRICE = 95

export const DEFAULT_CONFIG: ShoeConfig = {
  colors: { upper: '#ece4d6', toe: '#1d2230', laces: '#ece4d6', stripe: '#b5432a', sole: '#ffffff' },
  material: 'leather',
}

export function materialOf(id: MaterialId): MaterialOption {
  return MATERIALS.find((m) => m.id === id) ?? (MATERIALS[0] as MaterialOption)
}

export function setPartColor(config: ShoeConfig, part: PartId, hex: string): ShoeConfig {
  return { ...config, colors: { ...config.colors, [part]: hex } }
}

export function setMaterial(config: ShoeConfig, material: MaterialId): ShoeConfig {
  return { ...config, material }
}

/** Sample price for the demo: a base price plus the material surcharge. Colours are free. */
export function priceOf(config: ShoeConfig): number {
  return BASE_PRICE + materialOf(config.material).priceDelta
}

export function formatPrice(dollars: number): string {
  return `$${dollars.toFixed(2)}`
}
