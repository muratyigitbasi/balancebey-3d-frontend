import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import globals from 'globals'

export default [
  { ignores: ['dist/**', 'node_modules/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/cad/**/*.{ts,tsx}', 'src/pages/CadWorkspace.tsx'],
    languageOptions: { globals: { ...globals.browser } },
    rules: { '@typescript-eslint/no-unused-vars': 'error' },
  },
]
