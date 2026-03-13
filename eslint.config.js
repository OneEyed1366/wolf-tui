import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default tseslint.config(
	js.configs.recommended,
	...tseslint.configs.recommended,
	{
		files: ['**/*.{ts,tsx}'],
		plugins: {
			react,
			'react-hooks': reactHooks,
		},
		languageOptions: {
			parserOptions: {
				ecmaFeatures: { jsx: true },
			},
		},
		settings: {
			react: { version: 'detect' },
		},
		rules: {
			// React
			'react/react-in-jsx-scope': 'off',
			'react/prop-types': 'off',
			'react-hooks/rules-of-hooks': 'error',
			'react-hooks/exhaustive-deps': 'warn',

			// TypeScript
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_' },
			],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/consistent-type-imports': [
				'error',
				{ disallowTypeAnnotations: false },
			],

			// Allow internal_ and unstable__ prefixes
			camelcase: ['error', { allow: ['^internal_', '^unstable__'] }],
		},
	},
	{
		// Disable react-hooks rules for Vue package (Vue composables use 'use' prefix but aren't React hooks)
		files: ['packages/vue/**/*.{ts,tsx}'],
		rules: {
			'react-hooks/rules-of-hooks': 'off',
			'react-hooks/exhaustive-deps': 'off',
		},
	},
	{
		ignores: [
			'**/build/**',
			'**/node_modules/**',
			'**/*.js',
			'**/*.cjs',
			'**/*.mjs',
			'.claude/**',
			'.worktrees/**',
		],
	}
)
