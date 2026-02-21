import { defineLibConfig } from './src/build/lib';

export default defineLibConfig({
  nodejs: true,
  build: {
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
    },
  },
});
