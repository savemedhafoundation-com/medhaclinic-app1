import type { ReactNode } from 'react';
import { Stack, Typography } from '@mui/material';

type EmptyStateProps = {
  icon: ReactNode;
  title: string;
  description: string;
};

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <Stack alignItems="center" spacing={1.5} sx={{ py: 6 }}>
      <Stack
        alignItems="center"
        justifyContent="center"
        sx={{
          width: 60,
          height: 60,
          borderRadius: 4,
          bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.05)'),
          color: 'text.secondary',
        }}>
        {icon}
      </Stack>
      <Typography variant="h6">{title}</Typography>
      <Typography color="text.secondary" maxWidth={420} textAlign="center">
        {description}
      </Typography>
    </Stack>
  );
}
