import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores([
    'dist',
    'src/components/**',
    'src/contexts/**',
    'src/hooks/**',
    'src/lib/**',
    'src/pages/AdminPanel.jsx',
    'src/pages/Auth.jsx',
    'src/pages/ClientPortal.jsx',
    'src/pages/Dashboard.jsx',
    'src/pages/Landing.jsx',
    'src/pages/Pricing.jsx',
    'src/pages/ProjectDetail.jsx',
  ]),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', { varsIgnorePattern: '^[A-Z_]', argsIgnorePattern: '^_' }],
    },
  },
  {
    files: ['server/**/*.js'],
    languageOptions: {
      globals: globals.node,
    },
  },
])
