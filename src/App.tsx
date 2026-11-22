import { Suspense, lazy } from 'react'
import { Nav } from './components/Nav'
import Home from './pages/Home'
import { useRoute, type RouteId } from './lib/router'

const Configurator = lazy(() => import('./pages/ConfiguratorPage'))
const Hero = lazy(() => import('./pages/HeroPage'))
const Gallery = lazy(() => import('./pages/GalleryPage'))
const Planet = lazy(() => import('./pages/PlanetPage'))

function Page({ route }: { route: RouteId }) {
  switch (route) {
    case 'configurator':
      return <Configurator />
    case 'hero':
      return <Hero />
    case 'gallery':
      return <Gallery />
    case 'planet':
      return <Planet />
    default:
      return <Home />
  }
}

export default function App() {
  const route = useRoute()
  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <Nav route={route} />
      <main id="main" tabIndex={-1}>
        <Suspense
          fallback={
            <p className="loading" role="status">
              Loading the 3D scene...
            </p>
          }
        >
          <Page route={route} />
        </Suspense>
      </main>
      <footer className="footer">
        <span>Built by Chase Builds. MIT licensed.</span>
        <a href="https://github.com/chasebuilds/r3f-showcase">Source on GitHub</a>
      </footer>
    </>
  )
}
