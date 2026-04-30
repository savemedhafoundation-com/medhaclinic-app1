import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from './AuthProvider';

export function LoginPage() {
  const { signInWithGoogle, user, isAdmin } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const location = useLocation();
  const from = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';

  if (user && isAdmin) {
    return <Navigate replace to={from} />;
  }

  return (
    <main className="grid min-h-screen bg-zinc-950 text-white lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex flex-col justify-between bg-[linear-gradient(135deg,#153d28,#23864a)] p-8 md:p-12">
        <div className="text-sm font-semibold uppercase tracking-[0.2em] text-clinic-100">Medha Clinic</div>
        <div className="max-w-xl">
          <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">Operations console</h1>
          <p className="mt-5 text-lg leading-8 text-clinic-50">
            Secure workspace for patient operations, wellness reports, store fulfillment, and AI monitoring.
          </p>
        </div>
        <p className="text-sm text-clinic-100">Authorized internal staff only.</p>
      </section>

      <section className="flex items-center justify-center bg-zinc-50 p-6 text-zinc-950 dark:bg-zinc-950 dark:text-zinc-50">
        <div className="panel w-full max-w-md p-6">
          <h2 className="text-2xl font-semibold">Admin sign in</h2>
          <p className="mt-2 text-sm text-zinc-500">
            Continue with the authorized Google account. `mirajsk2000@gmail.com` is configured as super admin.
          </p>

          {error ? <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div> : null}

          <button
            className="button-primary mt-6 w-full"
            disabled={submitting}
            onClick={async () => {
              setError(null);
              setSubmitting(true);
              try {
                await signInWithGoogle();
              } catch (caught) {
                setError(caught instanceof Error ? caught.message : 'Could not sign in with Google.');
              } finally {
                setSubmitting(false);
              }
            }}
            type="button">
            {submitting ? 'Opening Google...' : 'Continue with Google'}
          </button>
        </div>
      </section>
    </main>
  );
}
