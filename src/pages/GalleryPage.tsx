import { useState } from 'react'
import { PageHead, UseIt } from '../components/PageHead'
import GalleryWall from '../scenes/GalleryWall'
import { SAMPLE_ITEMS } from '../scenes/gallery/items'
import { wrapIndex } from '../scenes/gallery/layout'

const CODE = `import GalleryWall from './scenes/GalleryWall'

const [active, setActive] = useState(0)
<GalleryWall items={myItems} activeIndex={active} onActiveChange={setActive} />`

export default function GalleryPage() {
  const [active, setActive] = useState(0)
  const count = SAMPLE_ITEMS.length
  const item = SAMPLE_ITEMS[wrapIndex(active, count)]
  return (
    <>
      <PageHead
        title="Gallery wall"
        lead="Panels hang in a ring around you. Hover one to bring it forward. Drag, tap a panel or use the buttons to turn the ring."
      />
      <GalleryWall activeIndex={active} onActiveChange={setActive} />
      <div className="panel gallery-bar">
        <button type="button" className="btn ghost" onClick={() => setActive(wrapIndex(active - 1, count))}>
          Previous
        </button>
        <p aria-live="polite">
          <strong>{item?.title}</strong>
          <span className="muted"> {item?.caption}</span>
        </p>
        <button type="button" className="btn ghost" onClick={() => setActive(wrapIndex(active + 1, count))}>
          Next
        </button>
      </div>
      <UseIt code={CODE} />
    </>
  )
}
