import * as fs from 'fs';
import * as path from 'path';

interface ComponentSpec {
  source: { module: string; export: string };
  meta?: { unsupported?: boolean };
  subComponents?: Record<string, unknown>;
}

interface MetaFile {
  version: string;
  source: string;
  generatedAt: string;
  components: Record<string, ComponentSpec>;
}

interface CoverageReport {
  totalComponents: number;
  supportedComponents: number;
  unsupportedComponents: string[];
  subComponentCounts: Record<string, number>;
  missingExports: string[];
}

export function runCoverageScan(metaPath: string, targetIndexPath: string): CoverageReport {
  if (!fs.existsSync(metaPath)) {
    throw new Error(`Meta file not found: ${metaPath}`);
  }

  const meta: MetaFile = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  const components = meta.components;

  const report: CoverageReport = {
    totalComponents: Object.keys(components).length,
    supportedComponents: 0,
    unsupportedComponents: [],
    subComponentCounts: {},
    missingExports: [],
  };

  for (const [name, spec] of Object.entries(components)) {
    if (spec.meta?.unsupported) {
      report.unsupportedComponents.push(name);
    } else {
      report.supportedComponents++;
    }

    if (spec.subComponents) {
      report.subComponentCounts[name] = Object.keys(spec.subComponents).length;
    }
  }

  if (targetIndexPath && fs.existsSync(targetIndexPath)) {
    const indexContent = fs.readFileSync(targetIndexPath, 'utf-8');
    for (const name of Object.keys(components)) {
      if (!indexContent.includes(name) && !indexContent.includes(name.replace(/([A-Z])/g, '-$1').toLowerCase())) {
        report.missingExports.push(name);
      }
    }
  }

  return report;
}

function printReport(report: CoverageReport, sourceName: string): void {
  console.log(`\n=== L4 Coverage Scan Report ===\n`);
  console.log(`Source: ${sourceName}`);
  console.log(`Total Components: ${report.totalComponents}`);
  console.log(`Supported: ${report.supportedComponents}`);
  console.log(`Unsupported: ${report.unsupportedComponents.length}`);

  if (report.unsupportedComponents.length > 0) {
    console.log(`\nUnsupported Components:`);
    for (const name of report.unsupportedComponents) {
      console.log(`  - ${name}`);
    }
  }

  const subCount = Object.values(report.subComponentCounts).reduce((a, b) => a + b, 0);
  console.log(`\nTotal Sub-components: ${subCount}`);

  if (report.missingExports.length > 0) {
    console.log(`\n⚠ Missing Exports: ${report.missingExports.length}`);
    for (const name of report.missingExports) {
      console.log(`  - ${name}`);
    }
  }

  const coverage = report.totalComponents > 0
    ? Math.round((report.supportedComponents / report.totalComponents) * 100)
    : 0;
  console.log(`\nCoverage: ${coverage}%`);

  if (coverage < 80) {
    console.log(`\n⚠ Warning: Coverage below 80%`);
    process.exit(1);
  }
}

const cwd = process.cwd();
const metaPath = path.join(cwd, '.vuact-port', 'meta.json');
const targetIndexPath = path.join(cwd, 'src', 'index.ts');

try {
  const report = runCoverageScan(metaPath, targetIndexPath);
  printReport(report, 'adapter-package');

  if (report.missingExports.length > 0) {
    process.exit(1);
  }
} catch (e) {
  console.error(`Coverage scan failed: ${e}`);
  process.exit(1);
}
