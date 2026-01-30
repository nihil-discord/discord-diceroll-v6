import path from 'node:path';
import { fileURLToPath } from 'node:url';

import js from '@eslint/js';
import stylistic from '@stylistic/eslint-plugin';
import importXPlugin from 'eslint-plugin-import-x';
import tseslint from 'typescript-eslint';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('eslint').Linter.FlatConfig[]} */
const baseConfig = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  stylistic.configs.customize({
    indent: 2,
    quotes: 'single',
    semi: true,
    jsx: true,
  }),

  // 기본 언어 옵션
  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        node: true,
        es2021: true,
      },
    },
  },

  // 플러그인 등록
  {
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      '@stylistic': stylistic,
      'import-x': importXPlugin,
    },
  },

  // 공통 무시 경로 (앱에서 baseConfig만 사용할 때 포함)
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/*.d.ts',
      '**/*.log',
    ],
  },

  // 공통 규칙 및 예외 처리
  {
    files: [ '**/*.{js,mjs,ts}', ],
    ignores: [],
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
    rules: {
      // 일반 규칙 off
      'no-console': 'off',
      'no-unused-vars': 'off',
      'no-unexpected-multiline': 'off',
      'no-use-before-define': 'off',
      'spaced-comment': 'off',
      'no-multiple-empty-lines': [
        'error',
        {
          max: 1,
          maxBOF: 0,
          maxEOF: 0,
        },
      ],
      'no-irregular-whitespace': 'error',
      'no-param-reassign': 'off',
      'eol-last': [
        'warn',
        'always',
      ],
      'no-plusplus': 'off',
      'no-restricted-syntax': 'off',
      'array-callback-return': 'off',
      'consistent-return': 'off',
      'no-nested-ternary': 'off',
      'no-shadow': 'off',
      'linebreak-style': 'off',
      'prefer-const': 'off',
      'max-len': 'off',
      'no-else-return': 'off',
      'no-lonely-if': 'off',
      'global-require': 'off',
      'class-methods-use-this': 'off',
      'no-useless-constructor': 'off',
      'no-useless-return': 'off',
      'lines-between-class-members': 'off',
      'arrow-body-style': 'off',
      'no-empty-function': 'off',
      'camelcase': 'off',
      'no-empty-pattern': 'off',
      'no-underscore-dangle': 'off',
      'function-call-argument-newline': 'off', // @stylistic 버전 사용
      'function-paren-newline': 'off', // @stylistic 버전 사용

      // import-x 규칙 (전역)
      'import-x/extensions': 'off',
      'import-x/no-extraneous-dependencies': 'off',
      'import-x/no-unresolved': 'off',
      'import-x/no-dynamic-require': 'off',
      'import-x/prefer-default-export': 'off',
      'import-x/order': [
        'warn',
        {
          'groups': [
            'builtin',
            'external',
            'internal',
            'parent',
            'sibling',
            'index',
          ],
          'newlines-between': 'always',
          'alphabetize': {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],
      'import-x/no-cycle': 'off',
      'import-x/no-self-import': 'error',
      'import-x/no-useless-path-segments': 'warn',

      // stylistic 규칙
      '@stylistic/multiline-ternary': [
        'warn',
        'always',
      ],
      '@stylistic/arrow-parens': [
        'error',
        'always',
      ],
      '@stylistic/quotes': [
        'error',
        'single',
        { allowTemplateLiterals: 'always', },
      ],
      '@stylistic/semi': [
        'error',
        'always',
      ],
      '@stylistic/array-bracket-spacing': [
        'warn',
        'always',
        {
          arraysInArrays: true,
          singleValue: true,
          objectsInArrays: true,
        },
      ],
      '@stylistic/computed-property-spacing': 'off',
      '@stylistic/object-curly-spacing': [
        'warn',
        'always',
      ],
      '@stylistic/object-curly-newline': [
        'error',
        {
          ObjectExpression: {
            multiline: true,
            consistent: true,
          },
          ObjectPattern: {
            multiline: true,
            consistent: true,
          },
          ImportDeclaration: {
            multiline: true,
            consistent: true,
          },
          ExportDeclaration: {
            multiline: true,
            consistent: true,
          },
        },
      ],
      '@stylistic/array-element-newline': [
        'error',
        {
          ArrayExpression: {
            minItems: 2,
            multiline: true,
          },
          ArrayPattern: {
            minItems: 2,
            multiline: true,
          },
        },
      ],
      '@stylistic/array-bracket-newline': [
        'error',
        {
          minItems: 2,
          multiline: true,
        },
      ],
      '@stylistic/object-property-newline': [
        'error',
        {
          allowAllPropertiesOnSameLine: false,
        },
      ],
      '@stylistic/comma-dangle': [
        'warn',
        {
          arrays: 'always',
          functions: 'never',
          objects: 'always',
          imports: 'never',
          exports: 'never',
        },
      ],
      '@stylistic/comma-style': [
        'error',
        'last',
        {
          exceptions: {
            ObjectExpression: true,
            ArrayExpression: true,
            VariableDeclaration: true,
            FunctionDeclaration: true,
            FunctionExpression: true,
            ArrowFunctionExpression: true,
          },
        },
      ],
      '@stylistic/indent': [
        'error',
        2,
        {
          FunctionDeclaration: { parameters: 1, },
          FunctionExpression: { parameters: 1, },
          CallExpression: { arguments: 1, },
        },
      ],

      // 함수 정의/호출 줄바꿈 규칙
      // multiline: 여러 줄에 걸친 매개변수일 때 괄호도 줄바꿈
      '@stylistic/function-paren-newline': [
        'error',
        'multiline',
      ],
      // always: 각 인자를 별도 줄에 배치
      '@stylistic/function-call-argument-newline': [
        'error',
        'always',
      ],

      // typescript-eslint 규칙
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/interface-name-prefix': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', },
      ],
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-shadow': 'warn',
      '@typescript-eslint/no-use-before-define': [
        'error',
        {
          functions: false,
          classes: true,
          variables: true,
        },
      ],
    },
  },

  // ts 파일에만 적용되는 파서
  {
    files: [ '**/*.ts', ],
    languageOptions: {
      parser: tseslint.parser,
    },
  },
  // TS 파일 전용 import-x 설정 및 규칙
  {
    files: [ '**/*.ts', ],
    settings: {
      'import-x/resolver': {
        typescript: {
          alwaysTryTypes: true,
          project: './tsconfig.json',
        },
        node: true,
      },
      'import-x/parsers': {
        '@typescript-eslint/parser': [ '.ts', ],
      },
    },
    rules: {
      'import-x/named': 'error',
      'import-x/default': 'error',
      'import-x/namespace': 'error',
    },
  },
];

const tsRulesConfig = {
  files: [ '**/*.ts', ],
  rules: {
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/consistent-type-imports': 'off',
    '@typescript-eslint/no-import-type-side-effects': 'off',
    '@typescript-eslint/no-unused-vars': [
      'warn',
      { argsIgnorePattern: '^_', },
    ],
  },
};

export default [
  ...baseConfig,
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: [ '**/*.ts', ],
  })),
  tsRulesConfig,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/.turbo/**',
      '**/coverage/**',
      '**/*.d.ts',
      '**/pnpm-lock.yaml',
      '**/.git/**',
      '**/.cursor/**',
      '**/public/**',
      '**/coverage/**',
      '**/*.log',
    ],
  },
  {
    files: [ 'custom-rules/**/*.js', ],
    languageOptions: {
      sourceType: 'commonjs',
      ecmaVersion: 'latest',
      globals: {
        console: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
  },
  {
    files: [ '**/*.ts', ],
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: __dirname,
        projectService: true,
      },
    },
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', },
      ],
    },
  },
];
