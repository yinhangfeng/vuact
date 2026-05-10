import type { ComponentSpec } from './types.js'

export interface HintsConfig {
  [componentName: string]: Partial<ComponentSpec>
}

export function defineHints(config: HintsConfig): HintsConfig {
  return config
}
