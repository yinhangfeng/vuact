import { Command } from 'commander';
import { parseDts } from './parser';
import { inferSpec } from './infer';
import { mergeHints } from './merge';
import { emitComponents } from './emit';
import type { HintsMap } from './dsl';

export interface GenerateOptions {
  source: string;
  entry: string;
  hints?: string;
  out: string;
}

export async function generate(options: GenerateOptions): Promise<void> {
  console.log(`Parsing ${options.entry}...`);
  const parseResult = parseDts(options.entry, options.source);

  console.log(`Found ${parseResult.components.length} components`);

  const specs: Record<string, any> = {};
  for (const comp of parseResult.components) {
    const { spec } = inferSpec(comp.name, comp.propsType);
    spec.source.module = options.source;
    specs[comp.name] = spec;
    console.log(`  - ${comp.name} (${comp.type})`);
  }

  if (options.hints) {
    console.log(`Loading hints from ${options.hints}...`);
    try {
      const hintsModule = await import(options.hints);
      const hints = hintsModule.default || hintsModule;
      const merged = mergeHints(specs, hints as HintsMap);
      Object.assign(specs, merged);
    } catch (e) {
      console.warn(`Failed to load hints: ${e}`);
    }
  }

  console.log(`Emitting to ${options.out}...`);
  emitComponents(specs, {
    outDir: options.out,
    sourceName: options.source,
    metaOutDir: path.join(options.out, '.vuact-port'),
  });

  console.log('Done!');
}

const program = new Command();

program
  .name('vuact-codegen')
  .description('Generate r2v wrapper code from React UI library d.ts files')
  .version('0.1.0')
  .requiredOption('-s, --source <source>', 'Source package name')
  .requiredOption('-e, --entry <entry>', 'Path to d.ts entry file')
  .requiredOption('-o, --out <outDir>', 'Output directory')
  .option('-h, --hints <hints>', 'Path to hints.ts file');

program.action(async (opts) => {
  await generate({
    source: opts.source,
    entry: opts.entry,
    hints: opts.hints,
    out: opts.out,
  });
});

import * as path from 'path';
