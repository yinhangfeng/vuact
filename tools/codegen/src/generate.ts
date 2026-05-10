import { parseDts } from './parser';
import { inferSpecs } from './infer';
import { mergeHints } from './merge';
import { emitComponent, emitIndex, emitImperative, emitMeta } from './emitter';
import type { ComponentSpec } from './types';
import * as fs from 'fs';
import * as path from 'path';

export interface GenerateOptions {
  source: string;
  entry: string;
  hints?: string;
  out: string;
  metaOut: string;
}

export async function generate(options: GenerateOptions): Promise<void> {
  console.log(`Parsing ${options.entry}...`);
  const parsed = parseDts(options.entry, options.source);
  console.log(`Found ${parsed.length} components`);

  console.log('Inferring specs...');
  const specs = inferSpecs(parsed);

  console.log('Merging hints...');
  const merged = options.hints ? mergeHints(specs, options.hints) : specs;

  console.log('Emitting components...');
  fs.mkdirSync(options.out, { recursive: true });

  for (const [name, spec] of Object.entries(merged)) {
    emitComponent(name, spec, options.out);
  }

  emitIndex(merged, options.out);
  emitImperative(parsed, options.out);

  const metaDir = path.dirname(options.metaOut);
  fs.mkdirSync(metaDir, { recursive: true });
  emitMeta(merged, options.metaOut, options.source);

  console.log('Done!');
}
