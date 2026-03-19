import type { ImagePickerAsset } from 'expo-image-picker';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { Platform } from 'react-native';

import {
  getCurrentAuthUser,
  updateCurrentUserPhotoUrl,
} from '../firebase/authClient';
import type { AppAuthUser } from '../firebase/authClient.types';
import { storage } from '../firebase/firebaseConfig';
import { saveCurrentUserPhotoUrl } from './medhaDataConnect';

type StorageAuthOverrideTarget = {
  _overrideAuthToken?: string | null;
  _delegate?: {
    _overrideAuthToken?: string | null;
  };
};

function sanitizeFileSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, '-');
}

function inferExtension(asset: ImagePickerAsset) {
  const fileName = asset.fileName?.trim() ?? '';
  const fileNameMatch = fileName.match(/\.([a-zA-Z0-9]+)$/);

  if (fileNameMatch?.[1]) {
    return fileNameMatch[1].toLowerCase();
  }

  const mimeType = asset.mimeType?.toLowerCase() ?? '';

  if (mimeType === 'image/png') {
    return 'png';
  }

  if (mimeType === 'image/webp') {
    return 'webp';
  }

  if (mimeType === 'image/heic' || mimeType === 'image/heif') {
    return 'heic';
  }

  return 'jpg';
}

async function getUploadableFile(asset: ImagePickerAsset) {
  if (asset.file) {
    return asset.file;
  }

  const response = await fetch(asset.uri);

  if (!response.ok) {
    throw new Error('Could not read the selected image before upload.');
  }

  return response.blob();
}

function getStorageAuthOverrideTarget() {
  const storageTarget = storage as unknown as StorageAuthOverrideTarget;

  if (storageTarget._delegate && typeof storageTarget._delegate === 'object') {
    return storageTarget._delegate;
  }

  return storageTarget;
}

function setStorageAuthOverrideToken(
  target: StorageAuthOverrideTarget,
  token: string | null
) {
  try {
    target._overrideAuthToken = token;
  } catch {
    Object.defineProperty(target, '_overrideAuthToken', {
      configurable: true,
      enumerable: false,
      writable: true,
      value: token,
    });
  }
}

async function withNativeStorageAuth<T>(
  user: AppAuthUser,
  work: () => Promise<T>
) {
  if (Platform.OS === 'web') {
    return work();
  }

  const target = getStorageAuthOverrideTarget();
  const previousToken = target._overrideAuthToken ?? null;
  const nextToken = await user.getIdToken(true);

  setStorageAuthOverrideToken(target, nextToken);

  try {
    return await work();
  } finally {
    setStorageAuthOverrideToken(target, previousToken);
  }
}

export async function uploadCurrentUserProfilePhoto(
  asset: ImagePickerAsset,
  authUser?: AppAuthUser | null
) {
  const signedInUser = authUser ?? getCurrentAuthUser();

  if (!signedInUser) {
    throw new Error('Please sign in again before uploading a profile photo.');
  }

  const uploadableFile = await getUploadableFile(asset);
  const extension = inferExtension(asset);
  const timestamp = Date.now();
  const filePath = `profile-images/${sanitizeFileSegment(signedInUser.uid)}/${timestamp}.${extension}`;
  const storageRef = ref(storage, filePath);

  const downloadUrl = await withNativeStorageAuth(signedInUser, async () => {
    try {
      await uploadBytes(storageRef, uploadableFile, {
        contentType: asset.mimeType ?? 'image/jpeg',
        cacheControl: 'public,max-age=3600',
      });
    } finally {
      if (
        'close' in uploadableFile &&
        typeof uploadableFile.close === 'function'
      ) {
        uploadableFile.close();
      }
    }

    return getDownloadURL(storageRef);
  });

  await updateCurrentUserPhotoUrl(downloadUrl);
  await saveCurrentUserPhotoUrl(downloadUrl, signedInUser);

  return downloadUrl;
}
