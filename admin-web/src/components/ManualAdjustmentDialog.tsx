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

import type { ManualAdjustmentPayload } from '../services/types';

type ManualAdjustmentDialogProps = {
  open: boolean;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: ManualAdjustmentPayload) => void;
};

export function ManualAdjustmentDialog({
  open,
  submitting,
  onClose,
  onSubmit,
}: ManualAdjustmentDialogProps) {
  const [payload, setPayload] = useState<ManualAdjustmentPayload>({
    userId: '',
    amount: 0,
    operation: 'credit',
    reason: '',
  });

  useEffect(() => {
    if (open) {
      setPayload({
        userId: '',
        amount: 0,
        operation: 'credit',
        reason: '',
      });
    }
  }, [open]);

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>Manual wallet adjustment</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <TextField
            label="User ID"
            onChange={event => setPayload(current => ({ ...current, userId: event.target.value }))}
            value={payload.userId}
          />
          <TextField
            label="Operation"
            onChange={event =>
              setPayload(current => ({
                ...current,
                operation: event.target.value as ManualAdjustmentPayload['operation'],
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
            onChange={event => setPayload(current => ({ ...current, reason: event.target.value }))}
            value={payload.reason}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          disabled={!payload.userId || !payload.amount || !payload.reason || submitting}
          onClick={() => onSubmit(payload)}
          variant="contained">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
}
