'use client';
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';

interface LocationSelectorProps {
  locations: string[];
  selectedLocation: string;
  onLocationChange: (location: string) => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

export default function LocationSelector({
  locations,
  selectedLocation,
  onLocationChange,
  loading = false,
  disabled = false,
  label = 'Location',
}: LocationSelectorProps) {
  return (
    <FormControl fullWidth sx={{ my: 1 }} disabled={disabled || loading}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={selectedLocation}
        onChange={(e) => onLocationChange(e.target.value)}
        label={label}
      >
        {loading ? (
          <MenuItem disabled>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Loading locations...
          </MenuItem>
        ) : (
          locations.map((loc) => (
            <MenuItem key={loc} value={loc}>
              {loc.charAt(0).toUpperCase() + loc.slice(1)}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );
}

