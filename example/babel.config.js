const path = require('path');
const { getConfig } = require('react-native-builder-bob/babel-config');
const pkg = require('../package.json');

const root = path.resolve(__dirname, '..');

module.exports = getConfig(
  {
    presets: ['module:@react-native/babel-preset'],
    // Reanimated 4 / Gesture Handler 3: worklets plugin must be listed last.
    plugins: ['react-native-worklets/plugin'],
  },
  { root, pkg }
);
