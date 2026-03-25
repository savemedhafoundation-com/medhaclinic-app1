import { useEffect, useState } from 'react';

import { AsyncStorage } from '../firebase/firebaseConfig';
import { useAuth } from '../providers/AuthProvider';
import { getCurrentUserData } from '../services/medhaDataConnect';

type StoredUser = {
  fullName?: string;
  age?: string;
  gender?: string | null;
  photoURL?: string | null;
};

type RemoteUser = {
  name?: string | null;
  photoUrl?: string | null;
  profile?: {
    age?: number | null;
    gender?: string | null;
  } | null;
};

function readString(value: unknown) {
  return typeof value === 'string' ? value : undefined;
}

function readNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function normalizeRemoteUser(user: unknown): RemoteUser | null {
  if (!user || typeof user !== 'object') {
    return null;
  }

  const userRecord = user as Record<string, unknown>;
  const rawProfile = userRecord.profile;
  const profileRecord =
    rawProfile && typeof rawProfile === 'object'
      ? (rawProfile as Record<string, unknown>)
      : null;

  return {
    name: readString(userRecord.name),
    photoUrl: readString(userRecord.photoUrl),
    profile: profileRecord
      ? {
          age: readNumber(profileRecord.age),
          gender: readString(profileRecord.gender),
        }
      : null,
  };
}

function parseNumber(value?: string | number | null) {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : undefined;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }

  return undefined;
}

function formatGender(value?: string | null) {
  if (!value) {
    return '--';
  }

  const normalized = value.trim().toLowerCase();

  if (normalized.startsWith('m')) {
    return 'Male';
  }

  if (normalized.startsWith('f')) {
    return 'Female';
  }

  return value.trim();
}

export function usePatientProfile() {
  const { profile } = useAuth();
  const [storedUser, setStoredUser] = useState<StoredUser | null>(null);
  const [remoteUser, setRemoteUser] = useState<RemoteUser | null>(null);

  useEffect(() => {
    let active = true;

    async function loadPatientProfile() {
      try {
        const rawUser = await AsyncStorage.getItem('medha_user');

        if (rawUser && active) {
          setStoredUser(JSON.parse(rawUser) as StoredUser);
        }
      } catch (error) {
        console.log('Failed to load cached patient profile:', error);
      }

      try {
        const currentUserData = await getCurrentUserData();

        if (active) {
          setRemoteUser(normalizeRemoteUser(currentUserData?.user));
        }
      } catch (error) {
        console.log('Failed to load patient profile from Firebase:', error);
      }
    }

    void loadPatientProfile();

    return () => {
      active = false;
    };
  }, [profile?.uid, profile?.name, profile?.photoURL]);

  return {
    patientName:
      storedUser?.fullName?.trim() ||
      remoteUser?.name?.trim() ||
      profile?.name ||
      'MedhaClinic User',
    patientPhoto:
      remoteUser?.photoUrl || profile?.photoURL || storedUser?.photoURL || null,
    patientAge: parseNumber(remoteUser?.profile?.age ?? storedUser?.age),
    patientGender: formatGender(remoteUser?.profile?.gender ?? storedUser?.gender),
  };
}
