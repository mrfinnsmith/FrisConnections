'use client'

import { useState } from 'react'

// Test component that can trigger errors on demand
export default function ErrorTestComponent() {
  const [shouldError, setShouldError] = useState(false)

  if (shouldError) {
    throw new Error('Test error triggered by ErrorTestComponent')
  }

  return (
    <div className="mb-4 p-3 border border-gray-300 bg-gray-50 rounded text-xs">
      <details className="cursor-pointer">
        <summary className="font-medium text-gray-600 hover:text-gray-800">
          🧪 Dev Tools - Error Boundary Test
        </summary>
        <div className="mt-2 pt-2 border-t border-gray-200">
          <p className="text-gray-500 mb-2">
            Test error boundary handling by triggering a component error
          </p>
          <button
            onClick={() => setShouldError(true)}
            className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition-colors"
          >
            Trigger Test Error
          </button>
        </div>
      </details>
    </div>
  )
}
