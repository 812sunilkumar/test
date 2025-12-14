'use client';
import React from 'react';
import { Vehicle } from '../lib/types';

interface VehicleInfoProps {
  vehicle: Vehicle;
}

export default function VehicleInfo({ vehicle }: VehicleInfoProps) {
  return (
    <div className="mb-5 p-4 bg-blue-50 border border-blue-200 rounded-md">
      <h3 className="text-sm font-semibold text-blue-900 mb-3">Vehicle Availability</h3>
      <div className="space-y-2">
        <p className="text-sm text-gray-700">
          <span className="font-medium text-gray-800">Available Days:</span>{' '}
          <span className="text-gray-700">{vehicle.availableDays.join(', ').toUpperCase()}</span>
        </p>
        <p className="text-sm text-gray-700">
          <span className="font-medium text-gray-800">Available Time Window:</span>{' '}
          <span className="text-gray-700">{vehicle.availableFromTime} - {vehicle.availableToTime}</span>
          <span className="text-gray-500 text-xs ml-1">(subject to availability)</span>
        </p>
      </div>
    </div>
  );
}

