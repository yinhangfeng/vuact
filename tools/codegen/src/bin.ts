#!/usr/bin/env node

import { Command } from 'commander'
import { generate } from './index.js'
import type { ComponentMeta } from './types.js'

const program = new Command()

program
  .name('codegen')
  .description('Generate code from TypeScript definitions')
  .version('0.1.0')
  .requiredOption('--source <source>', 'source package name (e.g., "antd")')
  .requiredOption('--entry <entry>', 'path to d.ts entry file')
  .option('--hints <hints>', 'path to hints.ts file')
  .requiredOption('--out <outDir>', 'output directory for generated code')
  .action(async (options) => {
    try {
      console.log('Starting code generation...')
      console.log('  Source package:', options.source)
      console.log('  Entry file:', options.entry)
      console.log('  Hints file:', options.hints || 'not provided')
      console.log('  Output directory:', options.out)

      const components: ComponentMeta[] = await generate(options)

      console.log(`\nSuccessfully generated ${components.length} component wrappers!`)
      
      const needsReview = components.filter((c: ComponentMeta) => c.finalSpec.needsManualReview)
      if (needsReview.length > 0) {
        console.log(`\n${needsReview.length} components marked for manual review:`)
        needsReview.forEach((c: ComponentMeta) => console.log(`  - ${c.componentName}`))
      }
    } catch (error) {
      console.error('Code generation failed:', error)
      process.exit(1)
    }
  })

program.parse()
