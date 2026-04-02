import {
  Avatar,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
} from '@mui/material';

import { formatCurrency, formatDate, formatNumber } from '../lib/formatters';
import type { AdminUserDetails } from '../services/types';
import { StatusChip } from './StatusChip';

type UserDetailsDrawerProps = {
  open: boolean;
  onClose: () => void;
  user?: AdminUserDetails | null;
};

export function UserDetailsDrawer({ open, onClose, user }: UserDetailsDrawerProps) {
  return (
    <Drawer anchor="right" onClose={onClose} open={open}>
      <Stack spacing={3} sx={{ width: 360, p: 3 }}>
        <Stack alignItems="center" spacing={1.5}>
          <Avatar src={user?.avatarUrl ?? undefined} sx={{ width: 72, height: 72 }}>
            {user?.name?.[0] ?? user?.email?.[0] ?? 'U'}
          </Avatar>
          <Typography variant="h6">{user?.name ?? 'Unnamed user'}</Typography>
          <Typography color="text.secondary">{user?.email ?? 'No email address'}</Typography>
          <StatusChip label={user?.isBanned ? 'banned' : user?.status ?? 'active'} />
        </Stack>

        <Divider />

        <List disablePadding>
          <ListItem disableGutters>
            <ListItemText primary="Firebase UID" secondary={user?.firebaseUid ?? '—'} />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText primary="Role" secondary={user?.role ?? 'viewer'} />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText primary="Wallet balance" secondary={formatCurrency(user?.walletBalance ?? 0)} />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText primary="Games played" secondary={formatNumber(user?.gamesPlayed ?? 0)} />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText primary="Total transactions" secondary={formatNumber(user?.totalTransactions ?? 0)} />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText primary="Total withdrawals" secondary={formatNumber(user?.totalWithdrawals ?? 0)} />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText primary="Created" secondary={formatDate(user?.createdAt)} />
          </ListItem>
          <ListItem disableGutters>
            <ListItemText primary="Last seen" secondary={formatDate(user?.lastSeenAt)} />
          </ListItem>
        </List>
      </Stack>
    </Drawer>
  );
}
