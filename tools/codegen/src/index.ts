export * from './types.js'
export * from './dsl.js'
export { parseDtsFile, type ParsedComponent } from './parser.js'
export { inferSpec } from './infer.js'
export { loadHints, mergeSpecs } from './merge.js'
export { emitCode } from './emit.js'

import { parseDtsFile, type ParsedComponent } from './parser.js'
import { inferSpec } from './infer.js'
import { loadHints, mergeSpecs } from './merge.js'
import { emitCode } from './emit.js'
import type { CodegenOptions, ComponentMeta } from './types.js'

export async function generate(options: CodegenOptions): Promise<ComponentMeta[]> {
  const { sourcePackage, entryFile, hintsFile, outDir } = options

  const parsedComponents: ParsedComponent[] = parseDtsFile(entryFile)
  const hints = await loadHints(hintsFile)

  const componentMetas = parsedComponents.map((parsed: ParsedComponent) => {
    const inferred = inferSpec(parsed)
    const componentHints = hints[parsed.name] || {}
    return mergeSpecs(parsed, inferred, componentHints)
  })

  await emitCode(sourcePackage, outDir, componentMetas)

  return componentMetas
}
