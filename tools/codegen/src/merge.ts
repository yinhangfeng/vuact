import type { ComponentSpec } from './types';
import type { HintsMap } from './dsl';
import { createRequire } from 'module';

export function mergeHints(specs: Record<string, ComponentSpec>, hintsPath: string): Record<string, ComponentSpec> {
  let hints: HintsMap;
  try {
    const require = createRequire(hintsPath);
    const hintsModule = require(hintsPath);
    hints = hintsModule.default || hintsModule;
  } catch {
    console.warn(`Could not load hints from ${hintsPath}`);
    return specs;
  }

  const merged = { ...specs };

  for (const [name, hint] of Object.entries(hints)) {
    if (!merged[name]) {
      merged[name] = {
        source: { module: '', export: name },
        ...hint,
      } as ComponentSpec;
      continue;
    }

    merged[name] = deepMerge(merged[name], hint);
  }

  return merged;
}

function deepMerge(spec: ComponentSpec, hint: any): ComponentSpec {
  const result = { ...spec };

  for (const key of Object.keys(hint)) {
    if (key === 'meta') {
      result.meta = { ...spec.meta, ...hint.meta };
    } else if (key === 'slotsTransformConfig') {
      result.slotsTransformConfig = { ...spec.slotsTransformConfig, ...hint.slotsTransformConfig };
    } else if (hint[key] !== undefined) {
      (result as any)[key] = hint[key];
    }
  }

  return result;
}
