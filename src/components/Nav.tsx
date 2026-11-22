import { hrefFor, type RouteId } from '../lib/router'

export const NAV_ITEMS: readonly { id: RouteId; label: string }[] = [
  { id: 'home', label: 'Overview' },
  { id: 'configurator', label: 'Configurator' },
  { id: 'hero', label: 'Scroll hero' },
  { id: 'gallery', label: 'Gallery wall' },
  { id: 'planet', label: 'Shader planet' },
]

export function Nav({ route }: { route: RouteId }) {
  return (
    <header className="nav-wrap">
      <nav className="nav" aria-label="Scenes">
        {NAV_ITEMS.map((item) => (
          <a key={item.id} href={hrefFor(item.id)} aria-current={route === item.id ? 'page' : undefined}>
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  )
}
