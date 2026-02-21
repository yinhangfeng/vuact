import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import commonjs from 'vite-plugin-commonjs';

const aliasReact = process.env.ALIAS_REACT === 'true';

function resolvePath(path: string) {
  return fileURLToPath(new URL(path, import.meta.url));
}

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    __TEST_SCHEDULER__: true,
    __DEV__: false,
    __VUACT_SKIP_TEST__: true,
  },
  plugins: [commonjs(), vue()],
  resolve: {
    alias: {
      '@': resolvePath('./src'),
      'scheduler/vuact_mock': resolvePath('../test/scheduler-mock'),

      ...(aliasReact
        ? {
            'react/jsx-runtime': resolvePath(
              '../packages/vuact/src/jsx-runtime'
            ),
            'react/jsx-dev-runtime': resolvePath(
              '../packages/vuact/src/jsx-dev-runtime'
            ),
            react: resolvePath('../packages/vuact'),
            'react-dom/test-utils': resolvePath(
              '../packages/vuact-dom/src/test-utils'
            ),
            'react-dom/client': resolvePath('../packages/vuact-dom/src/client'),
            'react-dom/server': resolvePath('../packages/vuact-dom/src/server'),
            'react-dom': resolvePath('../packages/vuact-dom'),
          }
        : undefined),
    },
  },
  optimizeDeps: {
    /**
     * 设置 alias 之后能让 node_modules 中的模块比如 react-redux 依赖的 react 改成 vuact，但是 vite 默认会将 node_modules 中的依赖提前构建到
     * node_modules/.vite/deps 中，导致 alias 的 react(vuact) 1. 不会自动更新 2. 引入多份 vuact
     */
    exclude: aliasReact ? ['react', 'react-dom'] : [],
    // noDiscovery: true,
  },
  server: {
    port: 8008,
    open: true,
  },
  build: {
    target: 'esnext',
    minify: false,
    rollupOptions: {
      input: {
        // main: resolvePath('./test.html'),
        main: resolvePath('./index.html'),
        bench: resolvePath('./bench.html'),
      },
    },
  },
});
