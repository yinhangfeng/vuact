import path from 'path'
import fs from 'fs/promises'
import type { HintsConfig } from './dsl.js'
import type { ComponentSpec, ComponentMeta } from './types.js'
import type { ParsedComponent } from './parser.js'

export async function loadHints(hintsFile?: string): Promise<HintsConfig> {
  if (!hintsFile) return {}

  try {
    const fullPath = path.resolve(hintsFile)
    const module = await import(fullPath)
    return module.default || module.hints || {}
  } catch {
    return {}
  }
}

export function mergeSpecs(
  parsed: ParsedComponent,
  inferred: ComponentSpec,
  hints: Partial<ComponentSpec> = {}
): ComponentMeta {
  const finalSpec: ComponentSpec = {
    ...inferred,
    ...hints,
    name: parsed.name,
  }

  if (inferred.slotsTransformConfig || hints.slotsTransformConfig) {
    finalSpec.slotsTransformConfig = {
      ...inferred.slotsTransformConfig,
      ...hints.slotsTransformConfig,
    }
  }

  if (inferred.eventMappings || hints.eventMappings) {
    finalSpec.eventMappings = {
      ...inferred.eventMappings,
      ...hints.eventMappings,
    }
  }

  return {
    componentName: parsed.name,
    componentType: parsed.type,
    props: parsed.props,
    rawSpec: parsed.rawSpec,
    inferredSpec: inferred,
    hintsSpec: Object.keys(hints).length > 0 ? { name: parsed.name, ...hints } : undefined,
    finalSpec,
  }
}
