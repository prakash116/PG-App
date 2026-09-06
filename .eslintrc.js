module.exports = {
  root: true,
  extends: '@react-native',
  rules: {
    // `const { body, _isRetry, ...rest } = options` is how the client strips
    // internal fields before they reach fetch. The binding is unused on
    // purpose — that is the mechanism, not an oversight.
    '@typescript-eslint/no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true },
    ],

    // React Navigation's `tabBarIcon` is a render prop by design; the rule
    // reads every one as an accidentally-nested component.
    'react/no-unstable-nested-components': ['warn', { allowAsProps: true }],

    // `void somePromise()` is how this codebase marks a deliberately
    // un-awaited call, which is clearer than an empty .catch().
    'no-void': ['error', { allowAsStatement: true }],

    // Styles here are composed from runtime theme tokens, so they cannot live
    // in a StyleSheet. Static styles still do — see any styles.* in the tree.
    'react-native/no-inline-styles': 'off',
  },
};
