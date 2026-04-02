import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Stack,
  TextField,
} from '@mui/material';

import type { AdminUser, WalletAdjustmentPayload } from '../services/types';

type WalletDialogProps = {
  open: boolean;
  user?: AdminUser | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: WalletAdjustmentPayload) => void;
};

export function WalletDialog({ open, user, submitting, onClose, onSubmit }: WalletDialogProps) {
  const [payload, setPayload] = useState<WalletAdjustmentPayload>({
    amount: 0,
    operation: 'credit',
    reason: '',
  });

  useEffect(() => {
    if (open) {
      setPayload({
        amount: 0,
        operation: 'credit',
        reason: '',
      });
    }
  }, [open]);

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>{user ? `Update wallet for ${user.name ?? user.email ?? user.id}` : 'Update wallet'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="Operation"
            onChange={event =>
              setPayload(current => ({
                ...current,
                operation: event.target.value as WalletAdjustmentPayload['operation'],
              }))
            }
            select
            value={payload.operation}>
            <MenuItem value="credit">Credit</MenuItem>
            <MenuItem value="debit">Debit</MenuItem>
          </TextField>
          <TextField
            label="Amount"
            onChange={event =>
              setPayload(current => ({
                ...current,
                amount: Number(event.target.value),
              }))
            }
            type="number"
            value={payload.amount || ''}
          />
          <TextField
            label="Reason"
            multiline
            minRows={3}
            onChange={event =>
              setPayload(current => ({
                ...current,
                reason: event.target.value,
              }))
            }
            value={payload.reason}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={!payload.amount || !payload.reason || submitting}
          onClick={() => onSubmit(payload)}
          variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
