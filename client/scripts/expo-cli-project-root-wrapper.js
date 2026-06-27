#!/usr/bin/env node

const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const expoCli = require.resolve('expo/node_modules/@expo/cli/build/bin/cli', {
  paths: [projectRoot],
});
const args = process.argv.slice(2);

if (args[0] === 'export:embed') {
  for (let index = 1; index < args.length; index += 1) {
    const previous = args[index - 1];
    if (
      typeof args[index] === 'string' &&
      !args[index].startsWith('-') &&
      [
        '--entry-file',
        '--bundle-output',
        '--assets-dest',
        '--sourcemap-output',
        '--config',
      ].includes(previous)
    ) {
      args[index] = path.resolve(projectRoot, args[index]);
    }
  }
  process.chdir(projectRoot);
  args.push(projectRoot);
}

process.argv = [process.argv[0], expoCli, ...args];
require(expoCli);
