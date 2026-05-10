import {
  Project,
  SyntaxKind,
  Type,
  InterfaceDeclaration,
  TypeAliasDeclaration,
  VariableDeclaration,
  FunctionDeclaration,
  PropertySignature,
  CallExpression,
  Node,
} from 'ts-morph';

export interface ParsedComponent {
  name: string;
  exportPath: string;
  isForwardRef: boolean;
  isMemo: boolean;
  propsType: PropsInfo | null;
  subComponents: Record<string, ParsedComponent>;
  isImperative: boolean;
}

export interface PropsInfo {
  props: Record<string, PropInfo>;
}

export interface PropInfo {
  name: string;
  type: string;
  isOptional: boolean;
  isReactNode: boolean;
  isFunction: boolean;
  isEventHandler: boolean;
  functionParams?: string[];
  functionReturnType?: string;
}

export function parseDts(entryPath: string, sourceName: string): ParsedComponent[] {
  const project = new Project({
    tsConfigFilePath: undefined,
    compilerOptions: {
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
    },
    skipAddingFilesFromTsConfig: true,
  });

  const sourceFile = project.addSourceFileAtPath(entryPath);

  const components: ParsedComponent[] = [];

  for (const [name, declarations] of sourceFile.getExportedDeclarations()) {
    for (const decl of declarations) {
      const component = parseDeclaration(decl, name, sourceName);
      if (component) {
        components.push(component);
      }
    }
  }

  return components;
}

function parseDeclaration(decl: Node, name: string, sourceName: string): ParsedComponent | null {
  if (InterfaceDeclaration.isInterfaceDeclaration(decl) || TypeAliasDeclaration.isTypeAliasDeclaration(decl)) {
    return null;
  }

  const firstChar = name.charAt(0);
  if (firstChar !== firstChar.toUpperCase()) {
    return null;
  }

  const isForwardRef = checkIsForwardRef(decl);
  const isMemo = checkIsMemo(decl);
  const isImperative = checkIsImperative(decl, name);

  const propsType = extractPropsType(decl);

  return {
    name,
    exportPath: sourceName,
    isForwardRef,
    isMemo,
    propsType,
    subComponents: {},
    isImperative,
  };
}

function checkIsForwardRef(decl: Node): boolean {
  if (VariableDeclaration.isVariableDeclaration(decl)) {
    const initializer = decl.getInitializer();
    if (initializer && CallExpression.isCallExpression(initializer)) {
      const expr = initializer.getExpression();
      const text = expr.getText();
      if (text === 'forwardRef' || text === 'React.forwardRef') {
        return true;
      }
    }
    const type = decl.getType();
    const typeText = type.getText(decl);
    if (typeText.includes('ForwardRefExoticComponent') || typeText.includes('ForwardRefRenderFunction')) {
      return true;
    }
  }
  return false;
}

function checkIsMemo(decl: Node): boolean {
  if (VariableDeclaration.isVariableDeclaration(decl)) {
    const initializer = decl.getInitializer();
    if (initializer && CallExpression.isCallExpression(initializer)) {
      const expr = initializer.getExpression();
      const text = expr.getText();
      if (text === 'memo' || text === 'React.memo') {
        return true;
      }
    }
    const type = decl.getType();
    const typeText = type.getText(decl);
    if (typeText.includes('MemoExoticComponent')) {
      return true;
    }
  }
  return false;
}

function checkIsImperative(decl: Node, _name: string): boolean {
  if (VariableDeclaration.isVariableDeclaration(decl)) {
    const type = decl.getType();
    if (type.isIntersection()) {
      const types = type.getIntersectionTypes();
      const hasNonComponentPart = types.some((t) => {
        const text = t.getText(decl);
        return (
          !text.includes('FC') &&
          !text.includes('FunctionComponent') &&
          !text.includes('ForwardRefExoticComponent') &&
          !text.includes('MemoExoticComponent')
        );
      });
      if (hasNonComponentPart) {
        return true;
      }
    }
  }
  return false;
}

function extractPropsType(decl: Node): PropsInfo | null {
  let propsType: Type | undefined;

  if (VariableDeclaration.isVariableDeclaration(decl)) {
    const type = decl.getType();

    if (type.isIntersection()) {
      const types = type.getIntersectionTypes();
      const componentPart = types.find((t) => {
        const text = t.getText(decl);
        return (
          text.includes('FC') ||
          text.includes('FunctionComponent') ||
          text.includes('ForwardRefExoticComponent')
        );
      });
      const target = componentPart || type;
      const typeArgs = target.getTypeArguments();
      if (typeArgs.length > 0) {
        propsType = resolvePropsTypeArg(typeArgs[0], decl);
      }
    } else {
      const typeArgs = type.getTypeArguments();
      if (typeArgs.length > 0) {
        propsType = resolvePropsTypeArg(typeArgs[0], decl);
      }
    }
  } else if (FunctionDeclaration.isFunctionDeclaration(decl)) {
    const params = decl.getParameters();
    if (params.length > 0) {
      propsType = params[0].getType();
    }
  }

  if (!propsType) return null;

  return resolvePropsFromType(propsType, decl);
}

function resolvePropsTypeArg(typeArg: Type, decl: Node): Type {
  if (typeArg.isIntersection()) {
    const parts = typeArg.getIntersectionTypes();
    const nonRefPart = parts.find((p) => !p.getText(decl).includes('RefAttributes'));
    return nonRefPart || parts[0] || typeArg;
  }
  return typeArg;
}

function resolvePropsFromType(propsType: Type, locationNode: Node): PropsInfo {
  const props: Record<string, PropInfo> = {};

  const properties = propsType.getProperties();
  for (const prop of properties) {
    const propName = prop.getName();
    const valueDecl = prop.getValueDeclaration();
    if (!valueDecl) continue;

    const propType = prop.getTypeAtLocation(locationNode);
    const typeString = propType.getText(locationNode);

    let isOptional = false;
    if (PropertySignature.isPropertySignature(valueDecl)) {
      isOptional = valueDecl.hasQuestionToken();
    }

    const isReactNode = checkIsReactNode(propType, locationNode);
    const isFunction = propType.getCallSignatures().length > 0;
    const isEventHandler = isFunction && /^on[A-Z]/.test(propName);

    let functionParams: string[] | undefined;
    let functionReturnType: string | undefined;

    if (isFunction) {
      const signatures = propType.getCallSignatures();
      if (signatures.length > 0) {
        const sig = signatures[0];
        functionParams = sig.getParameters().map((p) => {
          const pType = p.getTypeAtLocation(locationNode);
          return pType.getText(locationNode);
        });
        const retType = sig.getReturnType();
        functionReturnType = retType.getText(locationNode);
      }
    }

    props[propName] = {
      name: propName,
      type: typeString,
      isOptional,
      isReactNode,
      isFunction,
      isEventHandler,
      functionParams,
      functionReturnType,
    };
  }

  return { props };
}

function checkIsReactNode(type: Type, locationNode: Node): boolean {
  const typeString = type.getText(locationNode);
  return (
    typeString.includes('ReactNode') ||
    typeString.includes('JSX.Element') ||
    typeString.includes('ReactElement')
  );
}
