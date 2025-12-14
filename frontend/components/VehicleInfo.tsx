'use client';
import React from 'react';
import { Box, Typography } from '@mui/material';
import { Vehicle } from '../lib/types';

interface VehicleInfoProps {
  vehicle: Vehicle;
  sx?: object;
}

export default function VehicleInfo({ vehicle, sx }: VehicleInfoProps) {
  return (
    <Box sx={{ mb: 1, p: 1.5, bgcolor: 'info.light', borderRadius: 1, ...sx }}>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        <strong>Available Days:</strong> {vehicle.availableDays.join(', ').toUpperCase()}
      </Typography>
      <Typography variant="body2" sx={{ mb: 0.5 }}>
        <strong>Available Time Window:</strong> {vehicle.availableFromTime} - {vehicle.availableToTime} (subject to availability)
      </Typography>
    </Box>
  );
}

