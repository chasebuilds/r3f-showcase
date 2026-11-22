import { CanvasTexture, SRGBColorSpace } from 'three'
import type { GalleryItem } from './items'

export const PANEL_ASPECT = 4 / 5

/** Draws a panel image with the 2D canvas API, so the gallery needs no image files. */
export function makePanelTexture(item: GalleryItem, width = 512): CanvasTexture {
  const height = Math.round(width / PANEL_ASPECT)
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const g = ctx.createLinearGradient(0, 0, width, height)
    g.addColorStop(0, item.from)
    g.addColorStop(1, item.to)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, width, height)

    ctx.fillStyle = 'rgba(255,255,255,0.14)'
    ctx.beginPath()
    ctx.arc(width * 0.78, height * 0.28, width * 0.3, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(0,0,0,0.18)'
    ctx.beginPath()
    ctx.arc(width * 0.2, height * 0.78, width * 0.36, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = '#ffffff'
    ctx.textBaseline = 'alphabetic'
    ctx.font = `700 ${Math.round(width * 0.1)}px system-ui, sans-serif`
    ctx.fillText(item.title, width * 0.08, height * 0.84)
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.font = `400 ${Math.round(width * 0.05)}px system-ui, sans-serif`
    ctx.fillText(item.caption, width * 0.08, height * 0.9)
  }
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  return texture
}
