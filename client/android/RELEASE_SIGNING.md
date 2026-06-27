# Android Release Signing

Use a dedicated upload key for Google Play App Signing. Do not use the debug
keystore for any Play release build.

## 1. Create an upload keystore

Run this from a secure local machine:

```powershell
keytool -genkeypair `
  -v `
  -storetype PKCS12 `
  -keystore medhaclinic-upload-key.jks `
  -alias upload `
  -keyalg RSA `
  -keysize 2048 `
  -validity 9125
```

Store the generated `.jks` file somewhere secure and never commit it.

## 2. Add signing properties

Add these values to `~/.gradle/gradle.properties` or your CI secret store:

```properties
RELEASE_STORE_FILE=C:\\path\\to\\medhaclinic-upload-key.jks
RELEASE_STORE_PASSWORD=your-store-password
RELEASE_KEY_ALIAS=upload
RELEASE_KEY_PASSWORD=your-key-password
```

The app build is configured to fail release tasks if any of these are missing.

## 3. Use Play App Signing

In Google Play Console:

1. Enable `Play App Signing`.
2. Upload the app with this upload key.
3. Keep the upload key backed up securely.

## 4. Build the release bundle

```powershell
cd android
.\gradlew.bat bundleRelease
```
