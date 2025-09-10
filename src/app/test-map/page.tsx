"use client";

import dynamic from "next/dynamic";
import { useState } from "react";

// Dynamically import Leaflet map with no SSR
const SimpleMap = dynamic(() => import("@/components/SimpleLeafletMap"), { 
  ssr: false,
  loading: () => <div className="h-96 w-full bg-gray-200 flex items-center justify-center rounded-lg">Loading Map...</div>
});

export default function TestMapPage() {
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">🗺️ Test Map Page</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-lg font-semibold mb-4">Simple Leaflet Map Test</h2>
          <div className="h-96 border border-gray-300 rounded">
            <SimpleMap />
          </div>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p>If you can see this page but not the map, there may be an issue with:</p>
          <ul className="list-disc ml-6 mt-2">
            <li>Leaflet CSS loading</li>
            <li>React-Leaflet components</li>
            <li>Dynamic imports</li>
            <li>Browser console errors</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
