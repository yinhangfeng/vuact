import { execSync } from 'child_process';
import { resolve, join, extname, dirname } from 'path';
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const reactRepoUrl = 'https://github.com/facebook/react.git';
const vuactTestsRootDir = resolve(__dirname, '../packages/vuact/src/__tests__');
const vuactDomTestsRootDir = resolve(
  __dirname,
  '../packages/vuact-dom/src/__tests__'
);

function cloneOrUpdate({ reactRootDir, reactBranch }) {
  if (!existsSync(reactRootDir)) {
    mkdirSync(reactRootDir, { recursive: true });
    execSync(`git clone -b ${reactBranch} ${reactRepoUrl} ${reactRootDir}`, {
      stdio: 'inherit',
    });
  } else {
    execSync(
      `cd ${reactRootDir} && git fetch && git checkout ${reactBranch} && git reset --hard origin/${reactBranch}`,
      {
        stdio: 'inherit',
      }
    );
  }
}

function syncReactTests() {
  const reactRootDir = resolve(__dirname, 'temp/react');
  const reactBranch = 'main';
  const nameSuffix = '';

  cloneOrUpdate({
    reactRootDir,
    reactBranch,
  });

  copyPackageTests({
    name: 'react',
    nameSuffix,
    reactRootDir,
    testsRootDir: vuactTestsRootDir,
    excludes: [
      'createReactClassIntegration-test.js',
      'ReactVersion-test.js',
      'ReactCoffeeScriptClass-test.coffee',
      'ReactMismatchedVersions-test.js',
      'testDefinitions',
      'ReactProfiler-test.internal.js',
      'ReactProfilerDevToolsIntegration-test.internal.js',
      'ReactClassEquivalence-test.js',
    ],
  });

  // copyTests({
  //   src: resolve(reactRootDir, 'packages/internal-test-utils'),
  //   dest: resolve(__dirname, '../test/react-internal-test-utils'),
  //   excludes: ['__tests__', 'package.json'],
  //   transform: false,
  // });
}

function syncReact18Tests() {
  const reactRootDir = resolve(__dirname, 'temp/react-18');
  const reactBranch = '18-3-1';
  const nameSuffix = '-18';

  cloneOrUpdate({
    reactRootDir,
    reactBranch,
  });

  copyPackageTests({
    name: 'react',
    nameSuffix,
    reactRootDir,
    testsRootDir: vuactTestsRootDir,
    excludes: [
      'createReactClassIntegration-test.js',
      'ReactVersion-test.js',
      'ReactCoffeeScriptClass-test.coffee',
      'ReactMismatchedVersions-test.js',
      'testDefinitions',
      'ReactProfiler-test.internal.js',
      'ReactProfilerDevToolsIntegration-test.internal.js',
      'ReactClassEquivalence-test.js',
    ],
  });

  copyPackageTests({
    name: 'react-dom',
    nameSuffix,
    reactRootDir,
    testsRootDir: vuactDomTestsRootDir,
    excludes: [],
  });

  copyPackageTests({
    name: 'react-reconciler',
    nameSuffix,
    reactRootDir,
    testsRootDir: vuactTestsRootDir,
    excludes: [],
  });

  // copyTests({
  //   src: resolve(reactRootDir, 'packages/internal-test-utils'),
  //   dest: resolve(__dirname, '../test/react-internal-test-utils'),
  //   excludes: ['__tests__', 'package.json'],
  //   transform: false,
  // });
}

function copyPackageTests({
  name,
  nameSuffix,
  reactRootDir,
  testsRootDir,
  excludes = [],
}) {
  const packageTestsDir = resolve(
    reactRootDir,
    `packages/${name}/src/__tests__`
  );
  const vuactTestsDir = resolve(testsRootDir, `${name}${nameSuffix}`);

  copyTests({
    src: packageTestsDir,
    dest: vuactTestsDir,
    excludes,
  });
}

function copyTests({ src, dest, excludes, transform }) {
  if (existsSync(dest)) {
    execSync(`rm -rf ${dest}`);
  }
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src, {
    withFileTypes: true,
  });

  for (const entry of entries) {
    if (excludes.includes(entry.name)) {
      continue;
    }

    const childSrc = join(src, entry.name);
    const childDest = join(dest, entry.name);

    if (entry.isDirectory()) {
      copyTests({
        src: childSrc,
        dest: childDest,
        excludes,
        transform,
      });
    } else {
      copyTestFile({
        src: childSrc,
        dest: childDest,
        transform,
      });
    }
  }
}

function copyTestFile({ src, dest, transform = true }) {
  let content = readFileSync(src, 'utf8');
  const ext = extname(src).slice(1);

  if (['js', 'jsx', 'ts', 'tsx'].includes(ext) && !src.endsWith('.d.ts')) {
    const isJsx = content.includes('/>') || content.includes('</');

    let newExt = ext;
    if (isJsx) {
      newExt = 'tsx';
    } else if (ext === 'js') {
      newExt = 'ts';
    } else if (ext === 'jsx') {
      newExt = 'tsx';
    }
    dest = dest.slice(0, -ext.length) + newExt;

    if (transform) {
      // content = content.replace(/jest\./g, 'vi.');
    }
  }

  writeFileSync(dest, content);
}

function sync() {
  syncReactTests();
  syncReact18Tests();
}

sync();
