import fs from 'fs';
import path from 'path';
import { parseDtsFile } from './src/parser.js';
import { inferSpec } from './src/infer.js';
import { loadHints, mergeSpecs } from './src/merge.js';
import { emitCode } from './src/emit.js';

console.log('Testing codegen step by step...');

// Test parsing
const entryFile = '/workspace/tools/codegen/test-lib/src/index.d.ts';
console.log('Parsing file:', entryFile);
const parsedComponents = parseDtsFile(entryFile);
console.log('Parsed components:', parsedComponents.map(c => ({ name: c.name, props: c.props })));

// Test loading hints
const hintsFile = '/workspace/tools/codegen/test-lib/hints.ts';
console.log('\nLoading hints from:', hintsFile);
loadHints(hintsFile).then(async (hints) => {
  console.log('Hints loaded:', hints);
  
  // Merge specs
  const componentMetas = parsedComponents.map((parsed) => {
    const inferred = inferSpec(parsed);
    const componentHints = hints[parsed.name] || {};
    return mergeSpecs(parsed, inferred, componentHints);
  });
  
  console.log('\nComponent metas:', componentMetas.map(c => ({
    name: c.componentName,
    finalSpec: c.finalSpec
  })));
  
  // Emit code
  console.log('\nEmitting code...');
  await emitCode('test-lib', '/workspace/tools/codegen/test-out', componentMetas);
  console.log('Code emitted successfully!');
  
  // Check output
  console.log('\nGenerated files:');
  const files = fs.readdirSync('/workspace/tools/codegen/test-out', { recursive: true });
  console.log(files);
  
  // Show generated files content
  console.log('\nGenerated files content:');
  for (const file of files) {
    const fullPath = path.join('/workspace/tools/codegen/test-out', file);
    if (fs.statSync(fullPath).isFile()) {
      console.log(`\n=== ${file} ===`);
      console.log(fs.readFileSync(fullPath, 'utf-8'));
    }
  }
}).catch(console.error);
