import type { ImagePickerAsset } from 'expo-image-picker';
import {
  deleteObject,
  getDownloadURL,
  listAll,
  ref,
  type StorageReference,
  uploadBytes,
} from 'firebase/storage';
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

function getStorageErrorCode(error: unknown) {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code;
  }

  return null;
}

async function listStorageItems(
  storagePath: string
): Promise<StorageReference[]> {
  const listing = await listAll(ref(storage, storagePath));
  const nestedItems: StorageReference[][] = await Promise.all(
    listing.prefixes.map(prefix => listStorageItems(prefix.fullPath))
  );

  return [...listing.items, ...nestedItems.flat()];
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

export async function deleteCurrentUserProfilePhotos(
  authUser?: AppAuthUser | null
) {
  const signedInUser = authUser ?? getCurrentAuthUser();

  if (!signedInUser) {
    throw new Error('Please sign in again before deleting your account.');
  }

  const directoryPath = `profile-images/${sanitizeFileSegment(signedInUser.uid)}`;

  await withNativeStorageAuth(signedInUser, async () => {
    let items: Awaited<ReturnType<typeof listStorageItems>>;

    try {
      items = await listStorageItems(directoryPath);
    } catch (error) {
      if (getStorageErrorCode(error) === 'storage/object-not-found') {
        return;
      }

      throw error;
    }

    if (!items.length) {
      return;
    }

    const results = await Promise.allSettled(
      items.map((item: StorageReference) => deleteObject(item))
    );
    const firstFailure = results.find(
      result => result.status === 'rejected'
    ) as PromiseRejectedResult | undefined;

    if (firstFailure) {
      throw firstFailure.reason;
    }
  }).catch(error => {
    console.log('Profile photo cleanup failed:', error);
    throw new Error(
      'We could not remove your profile photos yet. Please try deleting your account again.'
    );
  });
}
