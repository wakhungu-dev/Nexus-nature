"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

// Simple dynamic import test
const SimpleMap = dynamic(() => import("@/components/SimpleLeafletMap"), { 
  ssr: false,
  loading: () => <div>Loading Map...</div>
});

export default function DebugMapPage() {
  const [error, setError] = useState<string>("");

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Debug Map Page</h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Test</h2>
          <p>If you can see this page, the route is working.</p>
          <p className="text-green-600">✅ Route accessible</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Simple Map Test</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Error: {error}
            </div>
          )}
          <div className="h-96 border-2 border-gray-300 rounded-lg overflow-hidden">
            <SimpleMap />
          </div>
        </div>
      </div>
    </div>
  );
}
