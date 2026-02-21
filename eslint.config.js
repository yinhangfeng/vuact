import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { includeIgnoreFile } from '@eslint/compat';
import importPlugin from 'eslint-plugin-import';
import unusedImports from 'eslint-plugin-unused-imports';
import {
  defineConfigWithVueTs,
  vueTsConfigs,
  configureVueProject,
} from '@vue/eslint-config-typescript';
import vueEslintConfigPrettier from '@vue/eslint-config-prettier/skip-formatting';
import pluginVue from 'eslint-plugin-vue';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

configureVueProject({
  scriptLangs: ['ts'],
});

export default defineConfigWithVueTs(
  includeIgnoreFile(path.resolve(__dirname, '.gitignore')),
  {
    ignores: [
      '**/__tests__/react-*/**',
      '**/playground/src/**',
      '!**/playground/src/examples/**',
      '.prettierrc.cjs',
      'scripts/**',
      'test/matchers/**',
    ],
  },
  pluginVue.configs['flat/essential'],
  vueTsConfigs.recommendedTypeChecked,
  importPlugin.flatConfigs.recommended,
  vueEslintConfigPrettier,
  {
    plugins: {
      'unused-imports': unusedImports,
    },
    languageOptions: {
      parserOptions: {
        ecmaVersion: 'latest',
      },
      globals: {
        __DEV__: true,
      },
    },
    rules: {
      'prefer-rest-params': 'off',
      'no-case-declarations': 'off',
      'import/no-unresolved': 'off',
      'import/named': 'off',
      'import/no-duplicates': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
            'object',
          ],
        },
      ],
      'import/export': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'none',
        },
      ],
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/only-throw-error': 'off',
      '@typescript-eslint/no-base-to-string': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/attribute-hyphenation': 'off',
      'vue/no-reserved-component-names': 'off',
    },
  }
);
