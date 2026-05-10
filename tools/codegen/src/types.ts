import type { ReactToVueOptions } from 'vuact';

export interface ComponentMeta {
  docUrl?: string;
  experimental?: boolean;
  needsManualReview?: boolean;
  unsupported?: boolean;
}

export interface ComponentSpec extends ReactToVueOptions {
  source: {
    module: string;
    export: string;
  };
  meta?: ComponentMeta;
  subComponents?: Record<string, ComponentSpec | string>;
}

export interface PortMetaFile {
  version: string;
  source: string;
  generatedAt: string;
  components: Record<string, ComponentSpec>;
}
