'use client';
import React from 'react';
import { TextField } from '@mui/material';
import { BookingFormData, Vehicle } from '../lib/types';

interface BookingFormFieldsProps {
  formData: BookingFormData;
  onFormDataChange: (updates: Partial<BookingFormData>) => void;
  selectedVehicle: Vehicle | null;
  minDate: string;
  maxDate: string;
}

export default function BookingFormFields({
  formData,
  onFormDataChange,
  selectedVehicle,
  minDate,
  maxDate,
}: BookingFormFieldsProps) {
  return (
    <>
      <TextField
        label="Date"
        type="date"
        fullWidth
        value={formData.date}
        onChange={(e) => onFormDataChange({ date: e.target.value })}
        InputLabelProps={{ shrink: true }}
        inputProps={{
          min: minDate,
          max: maxDate
        }}
        required
        sx={{ my: 1 }}
      />
      <TextField
        label="Time"
        type="time"
        fullWidth
        value={formData.time}
        onChange={(e) => onFormDataChange({ time: e.target.value })}
        InputLabelProps={{ shrink: true }}
        inputProps={{
          min: '00:00',
          max: '23:59'
        }}
        helperText={
          selectedVehicle
            ? `Vehicle available: ${selectedVehicle.availableFromTime} - ${selectedVehicle.availableToTime} (subject to availability)`
            : 'Select time (00:00 - 23:59)'
        }
        required
        sx={{ my: 1 }}
      />
      <TextField
        label="Duration (mins)"
        type="number"
        fullWidth
        value={formData.duration}
        onChange={(e) => onFormDataChange({ duration: Number(e.target.value) })}
        inputProps={{ min: 1 }}
        required
        sx={{ my: 1 }}
      />
      <TextField
        label="Name"
        fullWidth
        value={formData.name}
        onChange={(e) => onFormDataChange({ name: e.target.value })}
        required
        sx={{ my: 1 }}
      />
      <TextField
        label="Email"
        type="email"
        fullWidth
        value={formData.email}
        onChange={(e) => onFormDataChange({ email: e.target.value })}
        required
        sx={{ my: 1 }}
      />
      <TextField
        label="Phone"
        fullWidth
        value={formData.phone}
        onChange={(e) => onFormDataChange({ phone: e.target.value })}
        required
        sx={{ my: 1 }}
      />
    </>
  );
}

