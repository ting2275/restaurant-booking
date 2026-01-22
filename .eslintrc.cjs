module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'prettier'
  ],
  env: {
    browser: true,
    node: true,
    es6: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@babel/eslint-parser',
    requireConfigFile: false,
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    },
    babelOptions: {
      presets: ['@babel/preset-env']
    }
  },
  plugins: [
    'vue',
    'prettier'
  ],
  rules: {
    'vue/comment-directive': 'off',
    'vue/html-indent': [
      'error',
      2,
      {
        attribute: 1,
        baseIndent: 1,
        closeBracket: 0,
        alignAttributesVertically: true,
        ignores: []
      }
    ],
    'vue/html-quotes': ['error', 'single', { avoidEscape: true }],
    'vue/no-unused-vars': [
      'error',
      {
        ignorePattern: '^_'
      }
    ],
    'vue/multi-word-component-names': 'off',
    'vue/no-arrow-functions-in-watch': 'error',
    'vue/no-computed-properties-in-data': 'error',
    'vue/no-deprecated-events-api': 'error',
    'vue/no-deprecated-inline-template': 'error',
    'vue/no-deprecated-props-default-this': 'error',
    'vue/no-async-in-computed-properties': 'error',
    'vue/no-child-content': 'error',
    'vue/no-deprecated-v-bind-sync': 'error',
    'vue/no-deprecated-v-is': 'error',
    'vue/component-name-in-template-casing': ['error', 'PascalCase'],
    'vue/no-multiple-objects-in-class': 'error',
    'vue/no-multi-spaces': 'error',
    'vue/eqeqeq': ['error', 'always'],
    'vue/no-unused-properties': 'error',
    'vue/no-undef-properties': [
      'error',
      {
        ignores: ['/^\\$/']
      }
    ],
    'vue/no-dupe-keys': 'error',
    'vue/no-dupe-v-else-if': 'error',
    'vue/no-duplicate-attributes': [
      'error',
      {
        allowCoexistClass: true,
        allowCoexistStyle: true
      }
    ],
    'vue/no-export-in-script-setup': 'error',
    'vue/no-lifecycle-after-await': 'error',
    'vue/no-mutating-props': [
      'error',
      {
        shallowOnly: true
      }
    ],
    'vue/no-parsing-error': [
      'error',
      {
        'invalid-first-character-of-tag-name': true,
        'missing-attribute-value': true,
        'missing-end-tag-name': true,
        'missing-semicolon-after-character-reference': true,
        'missing-whitespace-between-attributes': true,
        'x-invalid-end-tag': false
      }
    ],
    'vue/no-use-v-if-with-v-for': [
      'error',
      {
        allowUsingIterationVar: true
      }
    ],
    'vue/no-unused-components': 'error',
    'vue/no-useless-template-attributes': 'error',
    'vue/no-v-for-template-key-on-child': 'error',
    'vue/no-v-text-v-html-on-component': [
      'error',
      {
        allow: ['RouterLink', 'router-link']
      }
    ],
    'vue/no-ref-as-operand': 'error',
    'vue/no-reserved-component-names': 'error',
    'vue/no-reserved-keys': 'error',
    'vue/no-reserved-props': 'error',
    'vue/no-shared-component-data': 'error',
    'vue/no-template-key': 'error',
    'vue/no-textarea-mustache': 'error',
    'vue/no-deprecated-router-link-tag-prop': [
      'error',
      {
        components: ['RouterLink', 'router-link']
      }
    ],
    'vue/no-v-html': 'off',
    'vue/no-deprecated-vue-config-keycodes': 'error',
    'vue/no-watch-after-await': 'error',
    'vue/prefer-import-from-vue': 'error',
    'vue/require-component-is': 'error',
    'vue/require-prop-type-constructor': 'error',
    'vue/require-slots-as-functions': 'error',
    'vue/require-v-for-key': 'error',
    'vue/require-valid-default-prop': 'error',
    'vue/valid-attribute-name': 'error',
    'vue/valid-define-emits': 'error',
    'vue/valid-define-props': 'error',
    'vue/valid-template-root': 'error',
    'vue/valid-v-bind': 'error',
    'vue/valid-v-if': 'error',
    'vue/valid-v-else-if': 'error',
    'vue/valid-v-else': 'error',
    'vue/valid-v-for': 'error',
    'vue/valid-v-html': 'error',
    'vue/valid-v-is': 'error',
    'vue/valid-v-model': 'error',
    'vue/valid-v-on': 'error',
    'vue/valid-v-once': 'error',
    'vue/valid-v-pre': 'error',
    'vue/valid-v-show': 'error',
    'vue/valid-v-slot': 'error',
    'vue/valid-v-text': 'error'
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [['@', './src']],
        extensions: ['.js', '.jsx', '.vue']
      }
    }
  }
};
