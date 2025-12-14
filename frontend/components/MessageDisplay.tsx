'use client';
import React from 'react';

interface MessageDisplayProps {
  message: string;
  isError?: boolean;
}

export default function MessageDisplay({ message, isError = false }: MessageDisplayProps) {
  if (!message) return null;

  const bgColor = isError ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200';
  const textColor = isError ? 'text-red-800' : 'text-green-800';
  const iconColor = isError ? 'text-red-500' : 'text-green-500';

  return (
    <div className={`p-4 rounded-md border ${bgColor} ${textColor} flex items-start gap-3`}>
      {isError ? (
        <svg className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      ) : (
        <svg className={`w-5 h-5 ${iconColor} flex-shrink-0 mt-0.5`} fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )}
      <p className="flex-1 font-medium">{message}</p>
    </div>
  );
}

