import type { ReactNode } from 'react';
import { Stack } from '@mui/material';

import { EmptyState } from '../components/EmptyState';
import { PageHeader } from '../components/PageHeader';
import { SectionCard } from '../components/SectionCard';

type PlaceholderPageProps = {
  title: string;
  description: string;
  icon: ReactNode;
};

export function PlaceholderPage({
  title,
  description,
  icon,
}: PlaceholderPageProps) {
  return (
    <Stack spacing={3}>
      <PageHeader
        subtitle="This section is wired into the admin shell and ready for its full implementation."
        title={title}
      />

      <SectionCard
        subtitle="Route available"
        title={`${title} workspace`}>
        <EmptyState
          description={description}
          icon={icon}
          title={`${title} page is ready`}
        />
      </SectionCard>
    </Stack>
  );
}
