import SentimentDissatisfiedOutlinedIcon from '@mui/icons-material/SentimentDissatisfiedOutlined';
import { Button, Stack, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <Stack alignItems="center" justifyContent="center" minHeight="70vh" spacing={2}>
      <SentimentDissatisfiedOutlinedIcon color="disabled" sx={{ fontSize: 48 }} />
      <Typography variant="h4">Page not found</Typography>
      <Typography color="text.secondary">The admin page you requested does not exist.</Typography>
      <Button component={RouterLink} to="/" variant="contained">
        Go back to dashboard
      </Button>
    </Stack>
  );
}
