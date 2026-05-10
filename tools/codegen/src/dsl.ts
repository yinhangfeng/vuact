import type { ReactToVueOptions } from 'vuact';

type HintsSpec = Partial<ReactToVueOptions> & {
  meta?: {
    docUrl?: string;
    experimental?: boolean;
    unsupported?: boolean;
  };
  subComponents?: Record<string, string | HintsSpec>;
};

export type HintsMap = Record<string, HintsSpec>;

export function defineHints(hints: HintsMap): HintsMap {
  return hints;
}
