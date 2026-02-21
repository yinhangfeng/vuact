import { resolve } from 'path';
import { defineConfig, configDefaults } from 'vitest/config';
import react from '@vitejs/plugin-react';
import commonjs from 'vite-plugin-commonjs';

export default defineConfig(() => {
  return {
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./test/setup-environment.ts', './test/setup.ts'],
      coverage: {
        provider: 'istanbul', // or 'v8'
      },
      include: [
        // ...configDefaults.include,
        '**/__tests__/**/*test?(.internal).?(c|m)[jt]s?(x)',
        // '**/__tests__/react-18/**/*-test?(.internal).?(c|m)[jt]s?(x)',
        // '**/__tests__/react-dom-19/**/*-test?(.internal).?(c|m)[jt]s?(x)',
        // '**/__tests__/react-reconciler-19/**/*-test?(.internal).?(c|m)[jt]s?(x)',
        // '**/__tests__/react-reconciler-19/ReactUse-test.*',
      ],
      exclude: [...configDefaults.exclude, './scripts/temp', './playground'],
      testTimeout: 4000,
    },
    plugins: [
      commonjs(),
      testAliasPlugin(),
      // vue(),
      // XXX 需要 NODE_ENV=production 否则会带上 @babel/plugin-transform-react-jsx-self 导致一些 element 比对的测试用例失败
      react({
        jsxImportSource: 'react',
        jsxRuntime: 'classic',
      }),
    ],
    resolve: {
      alias: {
        //   'react/jsx-runtime': resolve(
        //     __dirname,
        //     'packages/vuact/src/jsx-runtime'
        //   ),
        //   'react/jsx-dev-runtime': resolve(
        //     __dirname,
        //     'packages/vuact/src/jsx-dev-runtime'
        //   ),
        //   react: resolve(__dirname, 'packages/vuact'),
        //   'react-dom/test-utils': resolve(
        //     __dirname,
        //     'packages/vuact-dom/src/test-utils'
        //   ),
        //   'react-dom/client': resolve(__dirname, 'packages/vuact-dom/src/client'),
        //   'react-dom/server': resolve(__dirname, 'packages/vuact-dom/src/server'),
        //   'react-dom': resolve(__dirname, 'packages/vuact-dom'),
        //   'shared/ReactFeatureFlags': resolve(
        //     __dirname,
        //     'packages/vuact-shared/src/ReactFeatureFlags'
        //   ),
        //   // 'internal-test-utils': resolve(
        //   //   __dirname,
        //   //   'test/react-internal-test-utils'
        //   // ),
        'react-test-renderer': resolve(
          __dirname,
          'packages/vuact-test-renderer'
        ),
        'react-noop-renderer': resolve(
          __dirname,
          'packages/vuact-noop-renderer'
        ),
        'jest-react': resolve(__dirname, 'test/jest-react-mock'),
        //   'scheduler/unstable_mock': resolve(__dirname, 'test/scheduler-mock'),
        //   scheduler: resolve(__dirname, 'test/scheduler-mock'),
      },
    },
  };
});

function testAliasPlugin() {
  const alias = {
    'react/jsx-runtime': resolve(
      __dirname,
      'packages/vuact/src/jsx-runtime.ts'
    ),
    'react/jsx-dev-runtime': resolve(
      __dirname,
      'packages/vuact/src/jsx-dev-runtime.ts'
    ),
    react: resolve(__dirname, 'packages/vuact/src/index.ts'),
    'react-dom/test-utils': resolve(
      __dirname,
      'packages/vuact-dom/src/test-utils.ts'
    ),
    'react-dom/client': resolve(__dirname, 'packages/vuact-dom/src/client.ts'),
    'react-dom/server': resolve(__dirname, 'packages/vuact-dom/src/server.ts'),
    'react-dom': resolve(__dirname, 'packages/vuact-dom/src/index.ts'),
    'shared/ReactFeatureFlags': resolve(
      __dirname,
      'packages/vuact-shared/src/ReactFeatureFlags.ts'
    ),
    // 'internal-test-utils': resolve(
    //   __dirname,
    //   'test/react-internal-test-utils'
    // ),
    // 'react-test-renderer': resolve(
    //   __dirname,
    //   'packages/vuact-test-renderer/src/index.ts'
    // ),
    // 'react-noop-renderer': resolve(
    //   __dirname,
    //   'packages/vuact-noop-renderer/index.ts'
    // ),
    // 'jest-react': resolve(__dirname, 'test/jest-react-mock.ts'),
    'scheduler/unstable_mock': resolve(__dirname, 'test/scheduler-mock.ts'),
    scheduler: resolve(__dirname, 'test/scheduler-mock.ts'),
  };

  return {
    name: 'vuact-test-alias',
    enforce: 'pre',
    resolveId(source, importer) {
      const target = alias[source];
      if (target) {
        // __tests__ 目录中 react- 开头的文件才将 react 替换成 vuact
        // XXX 依赖包内的 react 依赖没法 alias 比如 react-cache
        if (importer.includes('__tests__/react-')) {
          return target;
        }
      }
      return null;
    },
  };
}
