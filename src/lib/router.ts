import { useEffect, useState } from 'react'

export type RouteId = 'home' | 'configurator' | 'hero' | 'gallery' | 'planet'

const ROUTES: readonly RouteId[] = ['home', 'configurator', 'hero', 'gallery', 'planet']

export function parseHash(hash: string): RouteId {
  const id = hash.replace(/^#\/?/, '').split('?')[0] ?? ''
  return (ROUTES as readonly string[]).includes(id) ? (id as RouteId) : 'home'
}

export function hrefFor(route: RouteId): string {
  return route === 'home' ? '#/' : `#/${route}`
}

export function useRoute(): RouteId {
  const [route, setRoute] = useState<RouteId>(() => parseHash(window.location.hash))
  useEffect(() => {
    const onChange = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
