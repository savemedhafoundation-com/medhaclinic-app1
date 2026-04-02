import { useEffect, useState } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import { formatCurrency } from '../lib/formatters';
import type { WithdrawalRecord } from '../services/types';

type WithdrawalReviewDialogProps = {
  mode: 'approve' | 'reject';
  open: boolean;
  record?: WithdrawalRecord | null;
  submitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: { note?: string }) => void;
};

export function WithdrawalReviewDialog({
  mode,
  open,
  record,
  submitting,
  onClose,
  onSubmit,
}: WithdrawalReviewDialogProps) {
  const [note, setNote] = useState('');

  useEffect(() => {
    if (open) {
      setNote('');
    }
  }, [open]);

  return (
    <Dialog fullWidth maxWidth="sm" onClose={onClose} open={open}>
      <DialogTitle>{mode === 'approve' ? 'Approve withdrawal' : 'Reject withdrawal'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ pt: 1 }}>
          <Typography color="text.secondary">
            {record?.userName ?? record?.userId} requested {formatCurrency(record?.amount ?? 0, record?.currency ?? 'INR')}.
          </Typography>
          <TextField
            label="Admin note"
            multiline
            minRows={3}
            onChange={event => setNote(event.target.value)}
            placeholder="Add an audit note for this decision"
            value={note}
          />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          color={mode === 'approve' ? 'success' : 'error'}
          disabled={submitting}
          onClick={() => onSubmit({ note: note || undefined })}
          variant="contained">
          {mode === 'approve' ? 'Approve' : 'Reject'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
