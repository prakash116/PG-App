module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: { '@': './src' },
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    ],
    // Reanimated 4 ships its Babel plugin inside react-native-worklets.
    // It rewrites worklet functions, so it has to run last, after every
    // other plugin has finished transforming the file.
    'react-native-worklets/plugin',
  ],
};
