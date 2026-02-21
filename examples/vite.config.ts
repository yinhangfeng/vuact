import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';

function resolvePath(path: string) {
  return fileURLToPath(new URL(path, import.meta.url));
}

// https://vitejs.dev/config/
export default defineConfig((env) => {
  const base =
    process.env.EXAMPLES_BASE ?? (env.command === 'serve' ? '/' : '/vuact/');
  return {
    base,
    define: {
      __TEST_SCHEDULER__: true,
      __DEV__: env.command === 'serve',
      __VUACT_SKIP_TEST__: true,
      'process.env.NODE_ENV':
        env.command === 'serve' ? "'development'" : "'production'",
      'process.env': JSON.stringify({}),
    },
    plugins: [
      vue(),
      (() => {
        // 只有 .vue.(j|t)sx 才会走 vueJsxPlugin
        const reactJsxReg = [/^(?!.*\.vue\.(j|t)sx$).+\.(j|t)sx$/];
        const vueJsxPlugin = vueJsx({
          exclude: reactJsxReg,
        });
        const originConfig: any = vueJsxPlugin.config;
        vueJsxPlugin.config = function (config, env) {
          const result = originConfig(config, env);
          result.esbuild.include = [/\.ts$/, ...reactJsxReg];
          return result;
        };
        return vueJsxPlugin;
      })(),
    ],
    resolve: {
      alias: {
        'react/jsx-runtime': resolvePath('../packages/vuact/src/jsx-runtime'),
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
      },
    },
    optimizeDeps: {
      /**
       * 设置 alias 之后能让 node_modules 中的模块比如 react-redux 依赖的 react 改成 vuact，但是 vite 默认会将 node_modules 中的依赖提前构建到
       * node_modules/.vite/deps 中，导致 alias 的 react(vuact) 1. 不会自动更新 2. 引入多份 vuact
       */
      exclude: ['react', 'react-dom'],
    },
    server: {
      port: 8009,
      open: true,
    },
    build: {
      target: 'esnext',
      minify: false,
      outDir: 'dist',
      lib: {
        entry: {
          index: './index.html',
          vue: './src/components/repl/modules/vue.ts',
          vuact: './src/components/repl/modules/vuact.ts',
          'vuact/jsx-runtime':
            './src/components/repl/modules/vuact-jsx-runtime.ts',
          'vuact-dom': './src/components/repl/modules/vuact-dom.ts',
          'vuact-dom/client':
            './src/components/repl/modules/vuact-dom-client.ts',
        },
        formats: ['es' as const],
      },
    },
  };
});
