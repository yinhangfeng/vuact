import { defineLibConfig } from '../../packages/build-tools';

export default defineLibConfig({
  build: {
    lib: {
      entry: {
        index: './src/index.ts',
        client: './src/client.ts',
        server: './src/server.ts',
        'test-utils': './src/test-utils.ts',
        'register-dom-components': './src/register-dom-components.ts',
      },
    },
  },
  plugins: [],
});
