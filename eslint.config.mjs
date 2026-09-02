import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'complexity': ['error', 10],
      'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }],
      'max-lines-per-function': ['error', { max: 30, skipBlankLines: true, skipComments: true }],
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    ignores: [
      'dist/**',
      'coverage/**',
      'node_modules/**',
      'scripts/**',
      'diagrams/**',
      'openspec/**',
      'project-logs/**',
      'utilities/**',
      '.antigravity/**',
      '.opencode/**',
      '.agents/**',
      '*.config.*',
    ],
  }
);
