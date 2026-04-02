import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { useAuth } from '../auth/AuthProvider';

const DEFAULT_ADMIN_EMAIL = import.meta.env.DEV
  ? import.meta.env.VITE_ADMIN_DEFAULT_EMAIL ?? ''
  : '';
const DEFAULT_ADMIN_PASSWORD = import.meta.env.DEV
  ? import.meta.env.VITE_ADMIN_DEFAULT_PASSWORD ?? ''
  : '';

export function LoginPage() {
  const { signIn, signInWithGoogle, user, isAdmin, loading } = useAuth();
  const location = useLocation();
  const [email, setEmail] = useState(DEFAULT_ADMIN_EMAIL);
  const [password, setPassword] = useState(DEFAULT_ADMIN_PASSWORD);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!loading && user && isAdmin) {
    const nextPath = (location.state as { from?: { pathname?: string } } | null)?.from?.pathname ?? '/';
    return <Navigate replace to={nextPath} />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        background:
          'radial-gradient(circle at top, rgba(34, 197, 94, 0.18), transparent 25%), linear-gradient(180deg, #f4f7f4 0%, #edf8ef 100%)',
      }}>
      <Card sx={{ maxWidth: 460, width: '100%' }}>
        <CardContent sx={{ p: 4 }}>
          <Stack spacing={3}>
            <Stack spacing={1}>
              <ShieldOutlinedIcon color="primary" sx={{ fontSize: 36 }} />
              <Typography variant="h4">Admin Sign In</Typography>
              <Typography color="text.secondary">
                Sign in with a Firebase admin user. For Gmail accounts in local development, use Google sign-in.
              </Typography>
            </Stack>

            {error ? <Alert severity="error">{error}</Alert> : null}

            <TextField
              autoComplete="email"
              label="Email"
              onChange={event => setEmail(event.target.value)}
              type="email"
              value={email}
            />
            <TextField
              autoComplete="current-password"
              label="Password"
              onChange={event => setPassword(event.target.value)}
              type="password"
              value={password}
            />

            <Button
              disabled={!email || !password || submitting}
              onClick={async () => {
                try {
                  setSubmitting(true);
                  setError('');
                  await signIn(email, password);
                } catch (nextError) {
                  const message = nextError instanceof Error ? nextError.message : 'Failed to sign in.';
                  setError(
                    message.includes('auth/operation-not-allowed')
                      ? 'Email/password sign-in is not enabled for this Firebase project. Use Google sign-in for this Gmail admin account, or enable Email/Password in Firebase Authentication.'
                      : message
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
              size="large"
              startIcon={submitting ? <CircularProgress color="inherit" size={18} /> : null}
              variant="contained">
              Sign in
            </Button>

            <Button
              disabled={submitting}
              onClick={async () => {
                try {
                  setSubmitting(true);
                  setError('');
                  await signInWithGoogle();
                } catch (nextError) {
                  const message = nextError instanceof Error ? nextError.message : 'Failed to sign in with Google.';
                  setError(
                    message.includes('auth/operation-not-allowed')
                      ? 'Google sign-in is not enabled for this Firebase project yet. Enable Google in Firebase Authentication before using this admin login.'
                      : message
                  );
                } finally {
                  setSubmitting(false);
                }
              }}
              size="large"
              variant="outlined">
              Continue with Google
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
