import type { ParsedComponent } from './parser.js'
import type { ComponentSpec } from './types.js'

export function inferSpec(component: ParsedComponent): ComponentSpec {
  const spec: ComponentSpec = { name: component.name }
  const { props } = component

  const slotsConfig = inferSlotsTransformConfig(props)
  if (Object.keys(slotsConfig).length > 0) {
    spec.slotsTransformConfig = slotsConfig
  }

  const vModel = inferVModel(props)
  if (vModel) {
    spec.vModel = vModel
  }

  const eventMappings = inferEventMappings(props)
  if (Object.keys(eventMappings).length > 0) {
    spec.eventMappings = eventMappings
  }

  spec.needsManualReview = shouldMarkForReview(props, component)

  return spec
}

function inferSlotsTransformConfig(props: string[]): Record<string, any> {
  const slotsConfig: Record<string, any> = {}
  const slotKeywords = ['children', 'render', 'item', 'icon', 'content']

  for (const prop of props) {
    const lowerProp = prop.toLowerCase()

    if (lowerProp.includes('children')) {
      slotsConfig[prop] = { type: 'element' }
    } else if (lowerProp.startsWith('render')) {
      slotsConfig[prop] = { type: 'render' }
    }
  }

  return slotsConfig
}

function inferVModel(props: string[]): string | undefined {
  const valueProps = ['value', 'modelValue', 'checked', 'selected']

  for (const valueProp of valueProps) {
    if (props.includes(valueProp)) {
      if (props.some((p: string) => p.toLowerCase().includes('change') || p.toLowerCase().includes('input'))) {
        return valueProp
      }
    }
  }

  return undefined
}

function inferEventMappings(props: string[]): Record<string, string> {
  const mappings: Record<string, string> = {}

  for (const prop of props) {
    if (prop.startsWith('on') && prop.length > 2) {
      const eventName = prop.charAt(2).toLowerCase() + prop.slice(3)
      mappings[prop] = eventName
    }
  }

  return mappings
}

function shouldMarkForReview(props: string[], component: ParsedComponent): boolean {
  const complexProps = ['ref', 'forwardedRef', 'renderProps', 'as', 'component']
  return complexProps.some((p: string) => props.includes(p)) || component.type === 'forwardRef'
}
