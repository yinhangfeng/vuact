import { generate } from './src/index.js';

async function main() {
  console.log('Testing codegen...');
  
  const components = await generate({
    sourcePackage: 'test-lib',
    entryFile: '/workspace/tools/codegen/test-lib/src/index.d.ts',
    hintsFile: '/workspace/tools/codegen/test-lib/hints.ts',
    outDir: '/workspace/tools/codegen/test-out'
  });
  
  console.log('Generated components:', components.map(c => c.componentName));
  console.log('Done!');
}

main().catch(console.error);
