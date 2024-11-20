import pluginJs from '@eslint/js';
import globals from 'globals';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  {
    ignores: ['jest.config.js', 'dist', 'out', '**/node_modules/**', '**/out/**', '**/dist/**'],
  },
];
