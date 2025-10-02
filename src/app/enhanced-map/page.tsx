"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

// Dynamic import of the instant map component (loads immediately)
const InstantMapComponent = dynamic(
  () => import("@/components/InstantMap").then((mod) => ({ 
    default: mod.InstantMap 
  })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-gray-100 rounded-lg animate-pulse"></div>
    ),
  }
);

// Memoized wrapper
const MemoizedInstantMap = React.memo(function MemoizedInstantMap() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-pulse h-4 w-16 bg-gray-300 rounded mx-auto mb-2"></div>
          <div className="text-xs text-gray-500">Initializing...</div>
        </div>
      </div>
    );
  }

  return <InstantMapComponent />;
});

export default function EnhancedMapPage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                🌿 Nature Explorer Map
              </h1>
              <p className="text-sm text-gray-600  mt-1">
                Discover amazing nature locations and start your green journey
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <div className="text-sm text-gray-600 ">
                  Welcome, <span className="font-medium">{session.user?.name}</span>
                </div>
              ) : (
                <div className="text-sm text-gray-500">
                  Sign in to track your nature activities
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Map Legend */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🗺️ Map Legend
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🌳</span>
                  <span className="text-sm text-gray-700">Parks & Gardens</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🌲</span>
                  <span className="text-sm text-gray-700">Forests</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">⛰️</span>
                  <span className="text-sm text-gray-700">Hills & Mountains</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🏞️</span>
                  <span className="text-sm text-gray-700">Lakes & Rivers</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🏖️</span>
                  <span className="text-sm text-gray-700">Beaches</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📍</span>
                  <span className="text-sm text-gray-700">Your Location</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                🎯 Quick Actions
              </h3>
              <div className="space-y-3">
                <button className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                  📍 Find My Location
                </button>
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                  🔍 Search Nearby
                </button>
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm transition-colors">
                  ⭐ View Favorites
                </button>
              </div>
            </div>

            {/* Activity Stats */}
            {session && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📊 Your Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Places Visited</span>
                    <span className="font-medium">12</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Green Hours</span>
                    <span className="font-medium">24.5</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">CO₂ Offset</span>
                    <span className="font-medium text-green-600">15.2 kg</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Map Container */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="h-[600px] rounded-lg overflow-hidden">
                <MemoizedInstantMap />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
