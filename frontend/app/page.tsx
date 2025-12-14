'use client';

import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center py-8 px-4 bg-gray-50">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">
            Nevo Test Drive Demo
          </h1>
          <p className="text-gray-600 mb-8">
            Book your test drive experience today
          </p>
          <Link href="/booktestdrive">
            <button className="w-full px-6 py-3 bg-blue-600 text-white font-semibold text-lg rounded-md hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 shadow-md hover:shadow-lg">
              Book Test Drive
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

