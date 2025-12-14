'use client';
import React from 'react';
import { Typography } from '@mui/material';

interface MessageDisplayProps {
  message: string;
  sx?: object;
}

export default function MessageDisplay({ message, sx }: MessageDisplayProps) {
  if (!message) return null;

  const isError = message.includes('Error') || message.includes('Not available') || message.includes('failed');
  const color = isError ? 'error.main' : 'success.main';

  return (
    <Typography
      sx={{
        mt: 1,
        color,
        ...sx
      }}
    >
      {message}
    </Typography>
  );
}

