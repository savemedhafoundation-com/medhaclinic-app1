import { Box, Button, CircularProgress, Stack, Typography } from '@mui/material';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from './AuthProvider';

export function ProtectedRoute() {
  const { loading, user, isAdmin, signOut } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="100vh" spacing={2}>
        <CircularProgress color="primary" />
        <Typography color="text.secondary">Checking your admin session...</Typography>
      </Stack>
    );
  }

  if (!user) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  if (!isAdmin) {
    return (
      <Stack alignItems="center" justifyContent="center" minHeight="100vh" spacing={2}>
        <Typography variant="h5">Admin access required</Typography>
        <Typography color="text.secondary" maxWidth={420} textAlign="center">
          Your Firebase account is signed in, but it does not include the required admin role claim.
        </Typography>
        <Box>
          <Button color="primary" onClick={() => void signOut()} variant="contained">
            Sign out
          </Button>
        </Box>
      </Stack>
    );
  }

  return <Outlet />;
}
