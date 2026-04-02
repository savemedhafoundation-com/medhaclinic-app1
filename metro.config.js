const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

module.exports = withNativeWind(config, {
  input: './global.css',
  // NativeWind's virtual CSS modules can crash Metro watch startup on Windows.
  // Falling back to filesystem output avoids that path and keeps bundling stable.
  forceWriteFileSystem: process.platform === 'win32',
});

