'use client';
import React from 'react';
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
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      <select
        value={selectedVehicle?.id || ''}
        onChange={(e) => {
          const vehicle = vehicles.find(v => v.id === e.target.value);
          onVehicleChange(vehicle || null);
        }}
        disabled={disabled || loading}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors text-gray-900"
      >
        <option value="">
          {loading 
            ? 'Loading vehicles...' 
            : disabled 
              ? 'Please select a location first' 
              : vehicles.length === 0 
                ? 'No vehicles available' 
                : 'Select vehicle'}
        </option>
        {vehicles.map((vehicle) => (
          <option key={vehicle.id} value={vehicle.id}>
            {formatVehicleType(vehicle.type)}
          </option>
        ))}
      </select>
    </div>
  );
}

