const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const fs = require('fs');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.projectRoot = __dirname;
config.workspaceRoot = __dirname;
config.watchFolders = (config.watchFolders || []).filter((folder) =>
  fs.existsSync(folder)
);
config.resolver = {
  ...config.resolver,
  disableHierarchicalLookup: true,
  nodeModulesPaths: [path.resolve(__dirname, 'node_modules')],
};

module.exports = withNativeWind(config, {
  input: './global.css',
  // NativeWind's virtual CSS modules can crash Metro watch startup on Windows.
  // Falling back to filesystem output avoids that path and keeps bundling stable.
  forceWriteFileSystem: process.platform === 'win32',
});

