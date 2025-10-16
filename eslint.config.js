import js from '@eslint/js'
import globals from 'globals'
import tsParser from '@typescript-eslint/parser'
import tsPlugin from '@typescript-eslint/eslint-plugin'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y'

const tsRecommendedRules = tsPlugin.configs?.recommended?.rules ?? {}
const tsStylisticRules = tsPlugin.configs?.stylistic?.rules ?? {}
const reactRecommendedRules = reactPlugin.configs?.recommended?.rules ?? {}
const reactJsxRuntimeRules = reactPlugin.configs?.['jsx-runtime']?.rules ?? {}
const reactHooksRules = reactHooksPlugin.configs?.recommended?.rules ?? {}
const a11yRecommendedRules = jsxA11yPlugin.configs?.recommended?.rules ?? {}

export default [
  {
    ignores: [
      'dist',
      'node_modules',
      'coverage',
      'playwright-report',
      'e2e/playwright-report'
    ]
  },
  js.configs.recommended,
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: { jsx: true }
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      'jsx-a11y': jsxA11yPlugin
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      ...tsRecommendedRules,
      ...tsStylisticRules,
      ...reactRecommendedRules,
      ...reactJsxRuntimeRules,
      ...reactHooksRules,
      ...a11yRecommendedRules,
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-undef': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-react': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_' }]
    }
  }
]
