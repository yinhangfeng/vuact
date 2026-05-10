import { Command } from 'commander';
import { generate } from './generate';

const program = new Command();

program
  .name('vuact-codegen')
  .description('Generate r2v wrapper code from React UI library d.ts files')
  .requiredOption('--source <name>', 'target library name (e.g. antd)')
  .requiredOption('--entry <path>', 'path to the target library d.ts entry file')
  .option('--hints <path>', 'path to hints.ts file')
  .option('--out <path>', 'output directory for generated components', 'src/components')
  .option('--meta-out <path>', 'output path for meta.json', '.vuact-port/meta.json')
  .action(async (options) => {
    await generate({
      source: options.source,
      entry: options.entry,
      hints: options.hints,
      out: options.out,
      metaOut: options.metaOut,
    });
  });

program.parse();
