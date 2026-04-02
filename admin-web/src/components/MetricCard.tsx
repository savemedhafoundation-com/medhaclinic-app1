import type { ReactNode } from 'react';
import { Card, CardContent, Stack, Typography } from '@mui/material';

type MetricCardProps = {
  title: string;
  value: string;
  helperText?: string;
  icon: ReactNode;
};

export function MetricCard({ title, value, helperText, icon }: MetricCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" spacing={2}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="body2">
              {title}
            </Typography>
            <Typography variant="h4">{value}</Typography>
            {helperText ? (
              <Typography color="text.secondary" variant="body2">
                {helperText}
              </Typography>
            ) : null}
          </Stack>
          <Stack
            alignItems="center"
            justifyContent="center"
            sx={{
              width: 56,
              height: 56,
              borderRadius: 4,
              bgcolor: theme => (theme.palette.mode === 'dark' ? 'rgba(34,197,94,0.18)' : 'rgba(34,197,94,0.12)'),
              color: 'primary.main',
            }}>
            {icon}
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
