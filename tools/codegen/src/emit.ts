import * as fs from 'fs';
import * as path from 'path';
import type { ComponentSpec, PortMetaFile } from './types';

export interface EmitOptions {
  outDir: string;
  sourceName: string;
  metaOutDir?: string;
}

export function emitComponents(
  components: Record<string, ComponentSpec>,
  options: EmitOptions
): void {
  const componentsDir = path.join(options.outDir, 'components');
  fs.mkdirSync(componentsDir, { recursive: true });

  for (const [name, spec] of Object.entries(components)) {
    emitComponent(name, spec, componentsDir);
  }

  emitIndex(components, componentsDir);
  emitMeta(components, options);
}

function emitComponent(name: string, spec: ComponentSpec, outDir: string): void {
  const pascalName = toPascalCase(name);
  const kebabName = toKebabCase(name);

  const lines: string[] = [];
  lines.push(`import { ${pascalName} as R${pascalName} } from '${spec.source.module}';`);
  lines.push(`import { r2v } from 'vuact';`);
  lines.push('');

  const specStr = buildSpecString(spec);
  if (specStr) {
    lines.push(`export const ${pascalName} = r2v(R${pascalName}, ${specStr});`);
  } else {
    lines.push(`export const ${pascalName} = r2v(R${pascalName});`);
  }

  if (spec.subComponents) {
    const subExports: string[] = [];
    for (const [subName, subSpec] of Object.entries(spec.subComponents)) {
      const subPascal = toPascalCase(subName);
      if (typeof subSpec === 'string') {
        lines.push(`export const ${pascalName}${subPascal} = r2v(R${pascalName}.${subPascal});`);
        subExports.push(subPascal);
      } else {
        const subSpecStr = buildSpecString(subSpec);
        if (subSpecStr) {
          lines.push(`export const ${pascalName}${subPascal} = r2v(R${pascalName}.${subPascal}, ${subSpecStr});`);
        } else {
          lines.push(`export const ${pascalName}${subPascal} = r2v(R${pascalName}.${subPascal});`);
        }
        subExports.push(subPascal);
      }
    }
    lines.push('');
    lines.push(`export const ${pascalName}WithSub = Object.assign(${pascalName}, {`);
    lines.push(subExports.map(e => `  ${e}: ${pascalName}${e}`).join(',\n'));
    lines.push('});');
  }

  fs.writeFileSync(path.join(outDir, `${kebabName}.ts`), lines.join('\n'));
}

function emitIndex(components: Record<string, ComponentSpec>, outDir: string): void {
  const lines: string[] = [];

  for (const name of Object.keys(components)) {
    const pascal = toPascalCase(name);
    lines.push(`export { ${pascal} } from './components/${toKebabCase(name)}';`);
    if (components[name].subComponents) {
      lines.push(`export { ${pascal}WithSub } from './components/${toKebabCase(name)}';`);
    }
  }

  fs.writeFileSync(path.join(outDir, 'index.ts'), lines.join('\n'));
}

function emitMeta(components: Record<string, ComponentSpec>, options: EmitOptions): void {
  const meta: PortMetaFile = {
    version: '1.0.0',
    source: options.sourceName,
    generatedAt: new Date().toISOString(),
    components,
  };

  const metaDir = options.metaOutDir || path.join(options.outDir, '.vuact-port');
  fs.mkdirSync(metaDir, { recursive: true });
  fs.writeFileSync(path.join(metaDir, 'meta.json'), JSON.stringify(meta, null, 2));
}

function buildSpecString(spec: ComponentSpec): string {
  const parts: string[] = [];

  if (spec.vModel) {
    const vModelStr = Array.isArray(spec.vModel)
      ? spec.vModel.map(v => `{ prop: '${v.prop}', event: '${v.event}'${v.modelName ? `, modelName: '${v.modelName}'` : ''}}`).join(', ')
      : `{ prop: '${spec.vModel.prop}', event: '${spec.vModel.event}'${spec.vModel.modelName ? `, modelName: '${spec.vModel.modelName}'` : ''}}`;
    parts.push(`vModel: [${vModelStr}]`);
  }

  if (spec.slotsTransformConfig) {
    const slotsStr = JSON.stringify(spec.slotsTransformConfig);
    parts.push(`slotsTransformConfig: ${slotsStr}`);
  }

  if (spec.eventMapping) {
    const emStr = JSON.stringify(spec.eventMapping);
    parts.push(`eventMapping: ${emStr}`);
  }

  if (spec.meta?.needsManualReview) {
    parts.push(`meta: { needsManualReview: true }`);
  }

  return parts.length > 0 ? `{ ${parts.join(', ')} }` : '';
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}
