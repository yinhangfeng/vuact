import type { ParsedComponent } from './parser';
import type { ComponentSpec } from './types';

export function inferSpecs(components: ParsedComponent[]): Record<string, ComponentSpec> {
  const specs: Record<string, ComponentSpec> = {};

  for (const comp of components) {
    if (comp.isImperative) {
      continue;
    }
    specs[comp.name] = inferSpec(comp);
  }

  return specs;
}

function inferSpec(comp: ParsedComponent): ComponentSpec {
  const spec: ComponentSpec = {
    source: { module: comp.exportPath, export: comp.name },
  };

  if (!comp.propsType) {
    spec.meta = { needsManualReview: true };
    return spec;
  }

  const slotsConfig: NonNullable<ComponentSpec['slotsTransformConfig']> = {};
  const eventNames: string[] = [];
  let hasVModelCandidate = false;
  let vModelProp: string | null = null;
  let vModelEvent: string | null = null;

  for (const [propName, propInfo] of Object.entries(comp.propsType.props)) {
    if (propInfo.isReactNode) {
      slotsConfig[propName] = { elementProp: true };
      continue;
    }

    if (
      propInfo.isFunction &&
      propInfo.functionReturnType &&
      isReactNodeType(propInfo.functionReturnType)
    ) {
      slotsConfig[propName] = { elementProp: false };
      continue;
    }

    if (propInfo.isEventHandler) {
      eventNames.push(propName);
      continue;
    }

    if (propName === 'value') {
      vModelProp = 'value';
    }
    if (propName === 'onChange' && vModelProp === 'value') {
      vModelEvent = 'onChange';
      hasVModelCandidate = true;
    }
  }

  if (Object.keys(slotsConfig).length > 0) {
    spec.slotsTransformConfig = slotsConfig;
  }

  if (hasVModelCandidate) {
    spec.vModel = { prop: vModelProp!, event: vModelEvent! };
  }

  if (comp.isForwardRef) {
    spec.meta = { ...spec.meta, needsManualReview: true };
  }

  if (Object.keys(comp.subComponents).length > 0) {
    spec.subComponents = {};
    for (const [subName, subComp] of Object.entries(comp.subComponents)) {
      spec.subComponents[subName] = inferSpec(subComp);
    }
  }

  return spec;
}

function isReactNodeType(typeStr: string): boolean {
  return (
    typeStr.includes('ReactNode') ||
    typeStr.includes('JSX.Element') ||
    typeStr.includes('ReactElement')
  );
}
