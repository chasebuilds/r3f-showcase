import { PageHead, UseIt } from '../components/PageHead'
import ScrollHero from '../scenes/ScrollHero'

const CODE = `import ScrollHero from './scenes/ScrollHero'

<ScrollHero
  steps={[{ title: 'Meet the product', body: 'One idea per screen.' }]}
  colors={['#ff7a3d', '#5f9fd1']}
/>`

export default function HeroPage() {
  return (
    <>
      <PageHead
        title="Scroll-driven hero"
        lead="Scroll down. The 3D object stays on screen while the camera, spin and colour follow your scroll."
      />
      <ScrollHero />
      <UseIt code={CODE} />
    </>
  )
}
