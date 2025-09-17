'use client';

import { useState } from 'react';

// Test component that can trigger errors on demand
export default function ErrorTestComponent() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('Test error triggered by ErrorTestComponent');
  }

  return (
    <div className="p-4 border border-red-200 bg-red-50 rounded">
      <h3 className="font-bold text-red-800 mb-2">Error Boundary Test</h3>
      <p className="text-red-700 text-sm mb-4">
        This component is only visible in development. Click the button to test error boundaries.
      </p>
      <button
        onClick={() => setShouldError(true)}
        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
      >
        Trigger Error
      </button>
    </div>
  );
}