module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        extensions: ['.tsx', '.ts', '.js', '.json'],
        alias: {
          '@': './src',
        },
      },
    ],
    'react-native-paper/babel',
    'react-native-reanimated/plugin',
  ],
};
