import { defineLibConfig } from '../../packages/build-tools';

export default defineLibConfig({
  define: {
    __TEST_SCHEDULER__: false,
  },
  build: {
    lib: {
      entry: {
        index: './src/index.ts',
        'jsx-runtime': './src/jsx-runtime.ts',
        'jsx-dev-runtime': './src/jsx-dev-runtime.ts',
        'setup-renderer': './src/setup-renderer.ts',
        'setup-scheduler': './src/setup-scheduler.ts',
      },
    },
  },
  plugins: [],
});
