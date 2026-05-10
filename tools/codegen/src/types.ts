export interface SlotTransformConfig {
  type?: 'element' | 'render'
  arguments?: string[]
  slotName?: string
}

export interface ComponentSpec {
  name: string
  slotsTransformConfig?: Record<string, SlotTransformConfig>
  vModel?: string
  eventMappings?: Record<string, string>
  needsManualReview?: boolean
}

export interface ComponentMeta {
  componentName: string
  componentType: 'function' | 'class' | 'forwardRef'
  props: string[]
  rawSpec: ComponentSpec
  inferredSpec: ComponentSpec
  hintsSpec?: ComponentSpec
  finalSpec: ComponentSpec
}

export interface PortMetaFile {
  version: string
  sourcePackage: string
  timestamp: string
  components: ComponentMeta[]
}

export interface CodegenOptions {
  sourcePackage: string
  entryFile: string
  hintsFile?: string
  outDir: string
}
