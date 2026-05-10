import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        bin: resolve(__dirname, 'src/bin.ts'),
        test: resolve(__dirname, 'test-simple.ts'),
        parseTest: resolve(__dirname, 'test-parser.ts'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      external: [
        'ts-morph',
        'commander',
        'path',
        'fs/promises',
        'fs',
        'vuact',
      ],
    },
  },
  plugins: [dts()],
})
