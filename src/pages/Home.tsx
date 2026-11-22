import { hrefFor, type RouteId } from '../lib/router'

interface Card {
  id: Exclude<RouteId, 'home'>
  title: string
  pitch: string
  who: string
}

const CARDS: readonly Card[] = [
  {
    id: 'configurator',
    title: 'Product configurator',
    pitch: 'Visitors pick a part, a colour and a material and watch a 3D product change.',
    who: 'Good for shoes, furniture, bikes, jewellery, signs.',
  },
  {
    id: 'hero',
    title: 'Scroll-driven hero',
    pitch: 'A 3D object that turns, moves and changes colour as the page scrolls.',
    who: 'Good for a launch page or a product story.',
  },
  {
    id: 'gallery',
    title: 'Gallery wall',
    pitch: 'Panels float around the visitor. Hover to bring one forward, drag to look around.',
    who: 'Good for portfolios, menus, listings and case studies.',
  },
  {
    id: 'planet',
    title: 'Shader planet',
    pitch: 'A glowing lava planet drawn by custom GLSL code, with heat and colour controls.',
    who: 'Good for a landing page, game site or event banner.',
  },
]

export default function Home() {
  const base = import.meta.env.BASE_URL
  return (
    <>
      <section className="intro">
        <p className="eyebrow">3D for the web, made for small business</p>
        <h1>Four 3D website pieces you can put on a real site</h1>
        <p className="lead">
          Each one is a working demo you can use right now. They load only when opened, pause when off screen, lower
          their sharpness on slow devices and hold still for visitors who ask for less motion.
        </p>
        <p className="lead">Pick one below. They all work on a phone.</p>
      </section>
      <ul className="cards">
        {CARDS.map((c) => (
          <li key={c.id}>
            <a className="card panel" href={hrefFor(c.id)}>
              <img src={`${base}thumbs/${c.id}.jpg`} width={480} height={300} alt="" loading="lazy" decoding="async" />
              <h2>{c.title}</h2>
              <p>{c.pitch}</p>
              <p className="muted">{c.who}</p>
            </a>
          </li>
        ))}
      </ul>
    </>
  )
}
