const fs = require('fs');
const path = require('path');

const targetPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'expo',
  'node_modules',
  '@expo',
  'cli',
  'build',
  'src',
  'start',
  'platforms',
  'android',
  'adb.js'
);

const patchMarker = 'Skipping stale emulator transport';

function patchExpoAdb() {
  if (!fs.existsSync(targetPath)) {
    console.log(`[patch-expo-android-adb] Target not found, skipping: ${targetPath}`);
    return;
  }

  let source = fs.readFileSync(targetPath, 'utf8');

  if (source.includes(patchMarker)) {
    console.log('[patch-expo-android-adb] Patch already applied.');
    return;
  }

  const emulatorLookupSnippet = `            name = await getAdbNameForDeviceIdAsync({
                pid
            }) ?? '';`;

  const patchedEmulatorLookupSnippet = `            try {
                name = await getAdbNameForDeviceIdAsync({
                    pid
                }) ?? '';
            } catch (error) {
                if (error.code === 'EMULATOR_NOT_FOUND' || (error.message || '').includes('could not connect to TCP port')) {
                    debug(\`Skipping stale emulator transport: \${pid}\`);
                    return null;
                }
                throw error;
            }`;

  const promiseAllSnippet = `    return Promise.all(devicePromises);`;
  const patchedPromiseAllSnippet = `    return (await Promise.all(devicePromises)).filter(Boolean);`;

  if (!source.includes(emulatorLookupSnippet) || !source.includes(promiseAllSnippet)) {
    console.log('[patch-expo-android-adb] Expected Expo CLI code shape not found, skipping.');
    return;
  }

  source = source.replace(emulatorLookupSnippet, patchedEmulatorLookupSnippet);
  source = source.replace(promiseAllSnippet, patchedPromiseAllSnippet);

  fs.writeFileSync(targetPath, source, 'utf8');
  console.log('[patch-expo-android-adb] Patch applied successfully.');
}

patchExpoAdb();
