import {
  Project,
  FunctionDeclaration,
  ClassDeclaration,
  VariableDeclaration,
} from 'ts-morph'
import type { ComponentSpec } from './types.js'
import fs from 'fs'

export interface ParsedComponent {
  name: string
  type: 'function' | 'class' | 'forwardRef'
  props: string[]
  rawSpec: ComponentSpec
}

export function parseDtsFile(entryFile: string): ParsedComponent[] {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
  })

  const content = fs.readFileSync(entryFile, 'utf-8')
  const sourceFile = project.createSourceFile('temp.d.ts', content)
  const components: ParsedComponent[] = []

  for (const decl of sourceFile.getExportedDeclarations()) {
    const [name, declarations] = decl
    for (const d of declarations) {
      const comp = tryParseComponent(d, name)
      if (comp) {
        components.push(comp)
      }
    }
  }

  return components
}

function tryParseComponent(
  decl: any,
  name: string
): ParsedComponent | undefined {
  if (decl instanceof FunctionDeclaration) {
    return parseFunctionComponent(decl, name)
  } else if (decl instanceof ClassDeclaration) {
    return parseClassComponent(decl, name)
  } else if (decl instanceof VariableDeclaration) {
    return parseVariableComponent(decl, name)
  }
  return undefined
}

function parseFunctionComponent(
  decl: FunctionDeclaration,
  name: string
): ParsedComponent | undefined {
  const props = extractPropsFromSignature(decl)
  return {
    name,
    type: 'function',
    props,
    rawSpec: { name },
  }
}

function parseClassComponent(
  decl: ClassDeclaration,
  name: string
): ParsedComponent | undefined {
  const props = extractPropsFromClass(decl)
  return {
    name,
    type: 'class',
    props,
    rawSpec: { name },
  }
}

function parseVariableComponent(
  decl: VariableDeclaration,
  name: string
): ParsedComponent | undefined {
  const initializer = decl.getInitializer()
  if (!initializer) return undefined

  const text = initializer.getText()
  let type: 'function' | 'class' | 'forwardRef' = 'function'

  if (text.includes('forwardRef')) {
    type = 'forwardRef'
  }

  const props = extractPropsFromVariable(decl)
  return {
    name,
    type,
    props,
    rawSpec: { name },
  }
}

function extractPropsFromSignature(decl: FunctionDeclaration): string[] {
  const params = decl.getParameters()
  if (params.length === 0) return []

  const propsParam = params[0]
  const typeNode = propsParam.getTypeNode()
  if (!typeNode) return []

  return extractPropsFromTypeNode(typeNode)
}

function extractPropsFromClass(decl: ClassDeclaration): string[] {
  const heritageClauses = decl.getHeritageClauses()
  for (const clause of heritageClauses) {
    if (clause.getText().includes('Component')) {
      const types = clause.getTypeNodes()
      if (types.length >= 2) {
        return extractPropsFromTypeNode(types[0])
      }
    }
  }
  return []
}

function extractPropsFromVariable(decl: VariableDeclaration): string[] {
  const typeNode = decl.getTypeNode()
  if (typeNode) {
    return extractPropsFromTypeNode(typeNode)
  }
  return []
}

function extractPropsFromTypeNode(typeNode: any): string[] {
  const text = typeNode.getText()
  const props: string[] = []

  try {
    const project = new Project()
    const tempSource = project.createSourceFile('temp.ts', `type T = ${text}`)
    const alias = tempSource.getTypeAliasOrThrow('T')
    const type = alias.getType()

    const properties = type.getProperties()
    for (const prop of properties) {
      if (!prop.getName().startsWith('_')) {
        props.push(prop.getName())
      }
    }
  } catch {
  }

  return props
}
