import { PageHead, UseIt } from '../components/PageHead'
import ProductConfigurator from '../scenes/ProductConfigurator'

const CODE = `import ProductConfigurator from './scenes/ProductConfigurator'

<ProductConfigurator
  onChange={(config) => console.log(config.colors, config.material)}
/>`

export default function ConfiguratorPage() {
  return (
    <>
      <PageHead
        title="Product configurator"
        lead="Pick a part, then a colour, then a material. The shoe is built from basic shapes in code, so there is no model file to download. Click the shoe itself to select a part."
      />
      <ProductConfigurator />
      <UseIt code={CODE} />
    </>
  )
}
