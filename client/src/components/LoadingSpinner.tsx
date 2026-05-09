import React from 'react';
import { TrendingUp } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="relative">
          <TrendingUp className="h-16 w-16 text-primary-600 animate-bounce-subtle mx-auto" />
          <div className="absolute inset-0 rounded-full border-4 border-primary-200 border-t-primary-600 animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading Saham Trading...</p>
      </div>
    </div>
  );
}