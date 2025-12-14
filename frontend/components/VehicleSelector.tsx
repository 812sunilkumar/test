'use client';
import React from 'react';
import { FormControl, InputLabel, Select, MenuItem, CircularProgress } from '@mui/material';
import { Vehicle } from '../lib/types';

interface VehicleSelectorProps {
  vehicles: Vehicle[];
  selectedVehicle: Vehicle | null;
  onVehicleChange: (vehicle: Vehicle | null) => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
}

export default function VehicleSelector({
  vehicles,
  selectedVehicle,
  onVehicleChange,
  loading = false,
  disabled = false,
  label = 'Vehicle',
}: VehicleSelectorProps) {
  const formatVehicleType = (type: string): string => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <FormControl fullWidth sx={{ my: 1 }} disabled={disabled || loading}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={selectedVehicle?.id || ''}
        onChange={(e) => {
          const vehicle = vehicles.find(v => v.id === e.target.value);
          onVehicleChange(vehicle || null);
        }}
        label={label}
      >
        {loading ? (
          <MenuItem disabled>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            Loading vehicles...
          </MenuItem>
        ) : vehicles.length === 0 ? (
          <MenuItem disabled>No vehicles available</MenuItem>
        ) : (
          vehicles.map((vehicle) => (
            <MenuItem key={vehicle.id} value={vehicle.id}>
              {formatVehicleType(vehicle.type)}
            </MenuItem>
          ))
        )}
      </Select>
    </FormControl>
  );
}

