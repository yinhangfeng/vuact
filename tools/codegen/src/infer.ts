import type { ComponentSpec, ComponentMeta } from './types';

export interface InferenceResult {
  spec: ComponentSpec;
  needsManualReview: boolean;
}

export function inferSpec(
  componentName: string,
  propsType?: string
): InferenceResult {
  const spec: ComponentSpec = {
    source: {
      module: '',
      export: componentName,
    },
  };

  let needsManualReview = false;

  if (propsType) {
    if (propsType.includes('ReactNode') || propsType.includes('ReactElement') || propsType.includes('JSX.Element')) {
      spec.slotsTransformConfig = {
        children: { elementProp: true },
      };
    }

    if (propsType.includes('value') && propsType.includes('onChange')) {
      spec.vModel = { prop: 'value', event: 'onChange' };
    }

    if (propsType.includes('checked') && propsType.includes('onChange')) {
      spec.vModel = { prop: 'checked', event: 'onChange' };
    }

    if (propsType.includes('open') && propsType.includes('onOpenChange')) {
      spec.vModel = { modelName: 'open', prop: 'open', event: 'onOpenChange' };
    }

    if (propsType.includes('render') || propsType.includes('Render')) {
      needsManualReview = true;
    }

    if (propsType.includes('children') && propsType.includes('ReactNode')) {
      spec.slotsTransformConfig = {
        ...spec.slotsTransformConfig,
        children: { elementProp: true },
      };
    }
  }

  if (componentName.includes('Form') || componentName.includes('Table') || componentName.includes('Modal')) {
    needsManualReview = true;
  }

  spec.meta = {
    needsManualReview,
  };

  return { spec, needsManualReview };
}
