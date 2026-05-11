import type { ComponentSpec } from './types';
import type { HintsMap } from './dsl';

export function mergeHints(
  specs: Record<string, ComponentSpec>,
  hints: HintsMap
): Record<string, ComponentSpec> {
  const merged: Record<string, ComponentSpec> = {};

  for (const [name, spec] of Object.entries(specs)) {
    const hint = hints[name];

    if (hint) {
      merged[name] = {
        ...spec,
        ...hint,
        source: spec.source,
        meta: {
          ...spec.meta,
          ...hint.meta,
        },
        vModel: hint.vModel ?? spec.vModel,
        slotsTransformConfig: hint.slotsTransformConfig ?? spec.slotsTransformConfig,
        eventMapping: hint.eventMapping ?? spec.eventMapping,
      };
    } else {
      merged[name] = spec;
    }
  }

  return merged;
}
