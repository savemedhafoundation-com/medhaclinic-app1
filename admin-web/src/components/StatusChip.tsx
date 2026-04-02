import { Chip } from '@mui/material';

type StatusChipProps = {
  label?: string | null;
};

export function StatusChip({ label }: StatusChipProps) {
  const normalized = (label ?? 'unknown').toLowerCase();

  let color: 'default' | 'success' | 'warning' | 'error' | 'info' = 'default';

  if (['active', 'approved', 'success', 'completed'].includes(normalized)) {
    color = 'success';
  } else if (['pending', 'processing', 'waiting'].includes(normalized)) {
    color = 'warning';
  } else if (['banned', 'failed', 'rejected', 'cancelled'].includes(normalized)) {
    color = 'error';
  } else if (['viewer', 'moderator'].includes(normalized)) {
    color = 'info';
  }

  return <Chip color={color} label={label ?? 'Unknown'} size="small" variant="outlined" />;
}
