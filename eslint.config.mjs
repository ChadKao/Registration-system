import globals from 'globals'
import pluginJs from '@eslint/js'
import importPlugin from 'eslint-plugin-import'
import nodePlugin from 'eslint-plugin-node'
import promisePlugin from 'eslint-plugin-promise'
import { FlatCompat } from '@eslint/eslintrc'

const compat = new FlatCompat()

export default [
  {
    files: ['**/*.js'],
    languageOptions: {
      sourceType: 'commonjs'
    },
    plugins: {
      import: importPlugin,
      node: nodePlugin,
      promise: promisePlugin
    }
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node
      }
    }
  },
  pluginJs.configs.recommended,
  ...compat.extends('eslint-config-standard')
]
