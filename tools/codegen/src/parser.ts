import { Project, SyntaxKind, type TypeAliasDeclaration, type InterfaceDeclaration, type FunctionDeclaration, type ClassDeclaration, type ExportableNode } from 'ts-morph';

export interface ParsedComponent {
  name: string;
  type: 'function' | 'class' | 'forwardRef' | 'unknown';
  propsType?: string;
  isReactComponent: boolean;
}

export interface ParseResult {
  components: ParsedComponent[];
  modulePath: string;
}

export function parseDts(entryPath: string, sourceName: string): ParseResult {
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
  });

  const sourceFile = project.addSourceFileAtPath(entryPath);
  const components: ParsedComponent[] = [];

  const exportedDeclarations = sourceFile.getExportedDeclarations();

  for (const [name, declarations] of exportedDeclarations) {
    const declaration = declarations[0];
    if (!declaration) continue;

    const parsed = parseDeclaration(name, declaration);
    if (parsed && parsed.isReactComponent) {
      components.push(parsed);
    }
  }

  return {
    components,
    modulePath: sourceName,
  };
}

function parseDeclaration(name: string, declaration: ExportableNode): ParsedComponent | null {
  const kind = declaration.getKind();

  if (kind === SyntaxKind.FunctionDeclaration) {
    const funcDecl = declaration as FunctionDeclaration;
    const returnType = funcDecl.getReturnType().getText();
    const isReact = returnType.includes('React') || returnType.includes('JSX') || returnType.includes('Element');

    return {
      name,
      type: 'function',
      isReactComponent: isReact || name[0] === name[0].toUpperCase(),
    };
  }

  if (kind === SyntaxKind.ClassDeclaration) {
    const classDecl = declaration as ClassDeclaration;
    const extendsClause = classDecl.getExtendsClause();
    const isReact = extendsClause?.getText().includes('React') || name.endsWith('Component');

    return {
      name,
      type: 'class',
      isReactComponent: isReact || name[0] === name[0].toUpperCase(),
    };
  }

  if (kind === SyntaxKind.TypeAliasDeclaration) {
    const typeAlias = declaration as TypeAliasDeclaration;
    const aliasedType = typeAlias.getType().getText();

    if (aliasedType.includes('forwardRef')) {
      return {
        name,
        type: 'forwardRef',
        isReactComponent: true,
      };
    }

    if (name[0] === name[0].toUpperCase() && name !== 'ReactNode' && name !== 'ReactElement') {
      return {
        name,
        type: 'unknown',
        isReactComponent: true,
        propsType: aliasedType,
      };
    }
  }

  if (kind === SyntaxKind.InterfaceDeclaration) {
    const iface = declaration as InterfaceDeclaration;
    const name_ = iface.getName();

    if (name_[0] === name_[0].toUpperCase() && !name_.includes('Props') && !name_.includes('Options')) {
      return {
        name: name_,
        type: 'unknown',
        isReactComponent: true,
      };
    }
  }

  return null;
}
