'use client';
import React from 'react';
import { Button } from '@mui/material';

interface BookingButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  loadingLabel?: string;
  fullWidth?: boolean;
  sx?: object;
}

export default function BookingButton({
  onClick,
  loading = false,
  disabled = false,
  label = 'Book Test Drive',
  loadingLabel = 'Processing...',
  fullWidth = true,
  sx,
}: BookingButtonProps) {
  return (
    <Button
      variant="contained"
      onClick={onClick}
      disabled={loading || disabled}
      fullWidth={fullWidth}
      sx={{ mt: 1, ...sx }}
    >
      {loading ? loadingLabel : label}
    </Button>
  );
}

