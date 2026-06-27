const fs = require('fs');
const path = require('path');

const targetPath = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-vector-icons',
  'android',
  'build.gradle'
);

const oldClasspath = 'classpath("com.android.tools.build:gradle:7.0.4")';
const newClasspath = 'classpath("com.android.tools.build:gradle:8.11.0")';

function patchVectorIconsGradle() {
  if (!fs.existsSync(targetPath)) {
    console.log(`[patch-vector-icons-gradle] Target not found, skipping: ${targetPath}`);
    return;
  }

  let source = fs.readFileSync(targetPath, 'utf8');

  if (source.includes(newClasspath)) {
    console.log('[patch-vector-icons-gradle] Patch already applied.');
    return;
  }

  if (!source.includes(oldClasspath)) {
    console.log('[patch-vector-icons-gradle] Expected Gradle classpath not found, skipping.');
    return;
  }

  source = source.replace(oldClasspath, newClasspath);
  fs.writeFileSync(targetPath, source, 'utf8');
  console.log('[patch-vector-icons-gradle] Patch applied successfully.');
}

patchVectorIconsGradle();
