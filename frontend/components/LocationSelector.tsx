'use client';
import React from 'react';

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
    <div className="mb-5">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} <span className="text-red-500">*</span>
      </label>
      <select
        value={selectedLocation}
        onChange={(e) => onLocationChange(e.target.value)}
        disabled={disabled || loading}
        className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors text-gray-900"
      >
        <option value="">
          {loading ? 'Loading locations...' : 'Select location'}
        </option>
        {locations.map((loc) => (
          <option key={loc} value={loc}>
            {loc.charAt(0).toUpperCase() + loc.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}

