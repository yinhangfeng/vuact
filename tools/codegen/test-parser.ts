import { Project, VariableDeclaration } from 'ts-morph';
import fs from 'fs';

const entryFile = '/workspace/tools/codegen/test-lib/src/index.d.ts';
const content = fs.readFileSync(entryFile, 'utf-8');
console.log('File content:\n', content);

const project = new Project({ skipAddingFilesFromTsConfig: true });
const sourceFile = project.createSourceFile('temp.d.ts', content);

console.log('\nAll exported declarations:');
for (const decl of sourceFile.getExportedDeclarations()) {
  const [name, declarations] = decl;
  console.log(`- ${name}: ${declarations.map(d => d.getKindName())}`);
  
  for (const d of declarations) {
    if (d instanceof VariableDeclaration) {
      console.log('  Variable declaration:', d.getText());
      console.log('  Type node:', d.getTypeNode()?.getText());
      const initializer = d.getInitializer();
      console.log('  Initializer:', initializer?.getText() || 'none');
    }
  }
}
