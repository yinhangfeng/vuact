import * as fs from 'fs';
import * as path from 'path';

interface ComponentSpec {
  source: { module: string; export: string };
  meta?: { needsManualReview?: boolean; unsupported?: boolean };
  vModel?: { modelName?: string; prop: string; event: string } | Array<{ modelName?: string; prop: string; event: string }>;
  slotsTransformConfig?: Record<string, { elementProp?: boolean; transformVNode?: boolean }>;
  subComponents?: Record<string, unknown>;
}

interface MetaFile {
  version: string;
  source: string;
  generatedAt: string;
  components: Record<string, ComponentSpec>;
}

export function runContractTests(metaPath: string): void {
  if (!fs.existsSync(metaPath)) {
    console.error(`Meta file not found: ${metaPath}`);
    process.exit(1);
  }

  const meta: MetaFile = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  const components = meta.components;

  console.log(`Running L1 contract tests for ${meta.source}`);
  console.log(`Found ${Object.keys(components).length} components\n`);

  let passed = 0;
  let failed = 0;

  for (const [name, spec] of Object.entries(components)) {
    try {
      validateSpec(name, spec);
      console.log(`✓ ${name}`);
      passed++;
    } catch (e) {
      console.error(`✗ ${name}: ${e}`);
      failed++;
    }
  }

  console.log(`\nResults: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

function validateSpec(name: string, spec: ComponentSpec): void {
  if (!spec.source?.module) {
    throw new Error('Missing source.module');
  }
  if (!spec.source?.export) {
    throw new Error('Missing source.export');
  }

  if (spec.meta?.unsupported) {
    return;
  }

  if (spec.vModel) {
    const models = Array.isArray(spec.vModel) ? spec.vModel : [spec.vModel];
    for (const model of models) {
      if (!model.prop) {
        throw new Error('vModel missing prop');
      }
      if (!model.event) {
        throw new Error('vModel missing event');
      }
    }
  }

  if (spec.slotsTransformConfig) {
    for (const [slotName, config] of Object.entries(spec.slotsTransformConfig)) {
      if (typeof config !== 'object') {
        throw new Error(`Invalid slotsTransformConfig for slot: ${slotName}`);
      }
    }
  }

  if (spec.subComponents) {
    for (const [subName, subSpec] of Object.entries(spec.subComponents)) {
      if (typeof subSpec === 'object' && subSpec !== null) {
        validateSpec(`${name}.${subName}`, subSpec as ComponentSpec);
      }
    }
  }
}

const metaPath = path.join(process.cwd(), '.vuact-port', 'meta.json');
runContractTests(metaPath);
