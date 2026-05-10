import path from 'path'
import fs from 'fs/promises'
import type { PortMetaFile, ComponentMeta } from './types.js'

export async function emitCode(
  sourcePackage: string,
  outDir: string,
  components: ComponentMeta[]
) {
  await fs.mkdir(outDir, { recursive: true })

  const vuactDir = path.join(outDir, '.vuact-port')
  await fs.mkdir(vuactDir, { recursive: true })

  await emitMetaFile(sourcePackage, vuactDir, components)
  await emitComponentFiles(outDir, components, sourcePackage)
  await emitIndexFile(outDir, components)
}

async function emitMetaFile(
  sourcePackage: string,
  vuactDir: string,
  components: ComponentMeta[]
) {
  const meta: PortMetaFile = {
    version: '1.0.0',
    sourcePackage,
    timestamp: new Date().toISOString(),
    components,
  }

  const metaPath = path.join(vuactDir, 'meta.json')
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2))
}

async function emitComponentFiles(
  outDir: string,
  components: ComponentMeta[],
  sourcePackage: string
) {
  const componentsDir = path.join(outDir, 'components')
  await fs.mkdir(componentsDir, { recursive: true })

  for (const comp of components) {
    const content = generateComponentFile(comp, sourcePackage)
    const filePath = path.join(componentsDir, `${comp.componentName}.ts`)
    await fs.writeFile(filePath, content)
  }
}

function generateComponentFile(meta: ComponentMeta, sourcePackage: string): string {
  const { componentName, finalSpec } = meta
  const hasSlots = finalSpec.slotsTransformConfig && Object.keys(finalSpec.slotsTransformConfig).length > 0

  let optionsStr = ''
  if (hasSlots) {
    optionsStr = `, { slotsTransformConfig: ${JSON.stringify(finalSpec.slotsTransformConfig, null, 2)} }`
  }

  return `import { reactToVue } from 'vuact'
import { ${componentName} as React${componentName} } from '${sourcePackage}'

export const ${componentName} = reactToVue(React${componentName}${optionsStr})
`
}

async function emitIndexFile(outDir: string, components: ComponentMeta[]) {
  const imports = components
    .map(c => `export { ${c.componentName} } from './components/${c.componentName}'`)
    .join('\n')

  const indexPath = path.join(outDir, 'index.ts')
  await fs.writeFile(indexPath, imports + '\n')
}
