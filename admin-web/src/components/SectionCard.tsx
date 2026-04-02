import type { ReactNode } from 'react';
import { Card, CardContent, Stack, Typography } from '@mui/material';

type SectionCardProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function SectionCard({ title, subtitle, action, children }: SectionCardProps) {
  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Stack
            alignItems={{ xs: 'flex-start', md: 'center' }}
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            spacing={2}>
            <Stack spacing={0.5}>
              <Typography variant="h6">{title}</Typography>
              {subtitle ? <Typography color="text.secondary">{subtitle}</Typography> : null}
            </Stack>
            {action}
          </Stack>
          {children}
        </Stack>
      </CardContent>
    </Card>
  );
}
