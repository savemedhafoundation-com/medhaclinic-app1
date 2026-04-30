import {
  GoogleAuthProvider,
  onIdTokenChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  type IdTokenResult,
  type User,
} from 'firebase/auth';
import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useQueryClient } from '@tanstack/react-query';

import { setTokenProvider } from '../../services/api';
import { firebaseAuth } from '../../services/firebase';
import type { Role } from '../../services/types';

type AuthContextValue = {
  user: User | null;
  claims: IdTokenResult['claims'] | null;
  loading: boolean;
  role: Role | null;
  isAdmin: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const bootstrapSuperAdminEmails = new Set(
  (
    import.meta.env.VITE_SUPER_ADMIN_EMAILS ??
    import.meta.env.VITE_ADMIN_ALLOWED_EMAILS ??
    'mirajsk2000@gmail.com'
  )
    .split(',')
    .map((email: string) => email.trim().toLowerCase())
    .filter(Boolean)
);

function readRole(claims: IdTokenResult['claims'] | null, user: User | null): Role | null {
  if (user?.email && bootstrapSuperAdminEmails.has(user.email.toLowerCase())) {
    return 'super_admin';
  }

  if (!claims) return null;
  if (claims.role === 'super_admin') return 'super_admin';
  if (claims.admin === true || claims.role === 'admin') return 'admin';
  if (claims.role === 'support') return 'support';
  if (claims.role === 'viewer') return 'viewer';
  return null;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [claims, setClaims] = useState<IdTokenResult['claims'] | null>(null);
  const [loading, setLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    setTokenProvider(async () => firebaseAuth.currentUser?.getIdToken(true) ?? null);

    const unsubscribe = onIdTokenChanged(firebaseAuth, async nextUser => {
      setUser(nextUser);

      if (!nextUser) {
        setClaims(null);
        setLoading(false);
        queryClient.clear();
        return;
      }

      const token = await nextUser.getIdTokenResult();
      setClaims(token.claims);
      setLoading(false);
    });

    return () => {
      unsubscribe();
      setTokenProvider(null);
    };
  }, [queryClient]);

  const role = readRole(claims, user);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      claims,
      loading,
      role,
      isAdmin: Boolean(role),
      signInWithGoogle: async () => {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({
          prompt: 'select_account',
        });
        await signInWithPopup(firebaseAuth, provider);
      },
      signOut: async () => {
        queryClient.clear();
        await firebaseSignOut(firebaseAuth);
      },
    }),
    [claims, loading, queryClient, role, user]
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
