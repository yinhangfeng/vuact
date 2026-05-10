import type { ComponentSpec, PortMetaFile } from './types';
import type { ParsedComponent } from './parser';
import * as fs from 'fs';
import * as path from 'path';

export function emitComponent(name: string, spec: ComponentSpec, outDir: string): void {
  const optionsStr = serializeOptions(spec);
  const hasSubComponents = spec.subComponents && Object.keys(spec.subComponents).length > 0;

  let code = '';

  const importLine = `import { r2v } from 'vuact';\nimport { ${name} as R${name} } from '${spec.source.module}';\n\n`;

  if (hasSubComponents) {
    const subEntries: Array<{ subName: string; exportName: string }> = [];
    for (const [subName, subSpec] of Object.entries(spec.subComponents!)) {
      if (typeof subSpec === 'string') continue;
      const subOptionsStr = serializeOptions(subSpec);
      const subExportName = `${name}${subName}`;
      code += `export const ${subExportName} = r2v(R${name}.${subName}, ${subOptionsStr});\n`;
      subEntries.push({ subName, exportName: subExportName });
    }

    code += `\nconst Raw${name} = r2v(R${name}, ${optionsStr});\n`;
    code += `export const ${name} = Object.assign(Raw${name}, {\n`;
    for (const sub of subEntries) {
      code += `  ${sub.subName}: ${sub.exportName},\n`;
    }
    code += `});\n`;
  } else {
    code += `export const ${name} = r2v(R${name}, ${optionsStr});\n`;
  }

  const filePath = path.join(outDir, `${name}.ts`);
  fs.writeFileSync(filePath, importLine + code);
}

function serializeOptions(spec: ComponentSpec): string {
  const parts: string[] = [];

  if (spec.slotsTransformConfig && Object.keys(spec.slotsTransformConfig).length > 0) {
    parts.push(`slotsTransformConfig: ${JSON.stringify(spec.slotsTransformConfig)}`);
  }

  if (spec.vModel) {
    parts.push(`vModel: ${JSON.stringify(spec.vModel)}`);
  }

  if (spec.eventMapping) {
    parts.push(`eventMapping: ${JSON.stringify(spec.eventMapping)}`);
  }

  if (parts.length === 0) {
    return '{}';
  }

  return `{ ${parts.join(', ')} }`;
}

export function emitIndex(specs: Record<string, ComponentSpec>, outDir: string): void {
  const componentsDirName = path.basename(outDir);
  const exports = Object.keys(specs).map((name) => {
    const subExports: string[] = [];
    if (specs[name].subComponents) {
      for (const subName of Object.keys(specs[name].subComponents!)) {
        subExports.push(`${name}${subName}`);
      }
    }
    return [name, ...subExports]
      .map((n) => `export { ${n} } from './${componentsDirName}/${name}';`)
      .join('\n');
  });

  fs.writeFileSync(path.join(outDir, '..', 'index.ts'), exports.join('\n\n') + '\n');
}

export function emitImperative(components: ParsedComponent[], outDir: string): void {
  const imperative = components.filter((c) => c.isImperative);
  if (imperative.length === 0) return;

  const source = imperative[0].exportPath;
  const names = imperative.map((c) => c.name);

  const code = `export { ${names.join(', ')} } from '${source}';\n`;
  fs.writeFileSync(path.join(outDir, '..', 'imperative.ts'), code);
}

export function emitMeta(specs: Record<string, ComponentSpec>, metaOut: string, source: string): void {
  const meta: PortMetaFile = {
    version: '1',
    source,
    generatedAt: new Date().toISOString(),
    components: specs,
  };

  fs.writeFileSync(metaOut, JSON.stringify(meta, null, 2) + '\n');
}
