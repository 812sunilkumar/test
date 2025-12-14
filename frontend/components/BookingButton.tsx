'use client';
import React from 'react';

interface BookingButtonProps {
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  label?: string;
  loadingLabel?: string;
}

export default function BookingButton({
  onClick,
  loading = false,
  disabled = false,
  label = 'Book Test Drive',
  loadingLabel = 'Processing...',
}: BookingButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={loading || disabled}
      className="w-full px-6 py-3 bg-blue-600 text-white font-semibold text-lg rounded-md hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:hover:bg-gray-400 transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none"
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          {loadingLabel}
        </span>
      ) : (
        label
      )}
    </button>
  );
}

