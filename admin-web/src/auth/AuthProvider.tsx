import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import {
  GoogleAuthProvider,
  onIdTokenChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  type IdTokenResult,
  type User,
} from 'firebase/auth';

import { firebaseAuth } from '../lib/firebase';
import { setAccessTokenProvider } from '../services/apiClient';

type AuthContextValue = {
  user: User | null;
  claims: IdTokenResult['claims'] | null;
  loading: boolean;
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const devAdminEmails = new Set(
  (import.meta.env.DEV
    ? import.meta.env.VITE_ADMIN_ALLOWED_EMAILS ??
      import.meta.env.VITE_ADMIN_DEFAULT_EMAIL ??
      ''
    : ''
  )
    .split(',')
    .map((value: string) => value.trim().toLowerCase())
    .filter(Boolean)
);

function readIsAdmin(claims: IdTokenResult['claims'] | null, user: User | null) {
  if (!claims) {
    return Boolean(
      import.meta.env.DEV &&
        user?.email &&
        devAdminEmails.has(user.email.toLowerCase())
    );
  }

  return (
    claims.admin === true ||
    claims.role === 'admin' ||
    Boolean(
      import.meta.env.DEV &&
        user?.email &&
        devAdminEmails.has(user.email.toLowerCase())
    )
  );
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<IdTokenResult['claims'] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setAccessTokenProvider(async () => firebaseAuth.currentUser?.getIdToken() ?? null);

    const unsubscribe = onIdTokenChanged(firebaseAuth, async nextUser => {
      setUser(nextUser);

      if (!nextUser) {
        setClaims(null);
        setLoading(false);
        return;
      }

      const tokenResult = await nextUser.getIdTokenResult();
      setClaims(tokenResult.claims);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      setAccessTokenProvider(null);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      claims,
      loading,
      isAdmin: readIsAdmin(claims, user),
      signIn: async (email, password) => {
        await signInWithEmailAndPassword(firebaseAuth, email, password);
      },
      signInWithGoogle: async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
          prompt: 'select_account',
        });
        await signInWithPopup(firebaseAuth, provider);
      },
      signOut: async () => {
        await firebaseSignOut(firebaseAuth);
      },
    }),
    [claims, loading, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
