'use client';
import React from 'react';
import { BookingFormData, Vehicle } from '../lib/types';

interface BookingFormFieldsProps {
  formData: BookingFormData;
  onFormDataChange: (updates: Partial<BookingFormData>) => void;
  selectedVehicle: Vehicle | null;
  minDate: string;
  maxDate: string;
}

const InputField = ({ label, ...props }: any) => (
  <div className="mb-5">
    <label className="block text-sm font-medium text-gray-700 mb-2">
      {label} <span className="text-red-500">*</span>
    </label>
    <input
      {...props}
      className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900 placeholder-gray-400"
    />
  </div>
);

export default function BookingFormFields({
  formData,
  onFormDataChange,
  selectedVehicle,
  minDate,
  maxDate,
}: BookingFormFieldsProps) {
  return (
    <>
      <InputField
        label="Date"
        type="date"
        value={formData.date}
        onChange={(e: any) => onFormDataChange({ date: e.target.value })}
        min={minDate}
        max={maxDate}
      />
      <div className="mb-5">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Time <span className="text-red-500">*</span>
        </label>
        <input
          type="time"
          value={formData.time}
          onChange={(e) => onFormDataChange({ time: e.target.value })}
          min="00:00"
          max="23:59"
          className="w-full px-4 py-2.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-gray-900"
        />
        <p className="text-xs text-gray-600 mt-2">
          {selectedVehicle
            ? `Vehicle available: ${selectedVehicle.availableFromTime} - ${selectedVehicle.availableToTime} (subject to availability)`
            : 'Select time (00:00 - 23:59)'}
        </p>
      </div>
      <InputField
        label="Duration (mins)"
        type="number"
        value={formData.duration}
        onChange={(e: any) => onFormDataChange({ duration: Number(e.target.value) })}
        min="1"
      />
      <InputField
        label="Name"
        type="text"
        value={formData.name}
        onChange={(e: any) => onFormDataChange({ name: e.target.value })}
      />
      <InputField
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e: any) => onFormDataChange({ email: e.target.value })}
      />
      <InputField
        label="Phone"
        type="tel"
        value={formData.phone}
        onChange={(e: any) => onFormDataChange({ phone: e.target.value })}
      />
    </>
  );
}

