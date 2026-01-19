/**
 * Copyright IBM Corp. 2020, 2025
 */

import pluginJs from '@eslint/js';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';

/** @type {import('eslint').Linter.Config[]} */
export default [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  prettierConfig,
  {
    ignores: ['jest.config.js', 'dist', 'out', '**/node_modules/**', '**/out/**', '**/dist/**'],
  },
];
