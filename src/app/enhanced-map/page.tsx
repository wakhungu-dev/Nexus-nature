"use client";

import React from "react";
import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

// Dynamically import the EnhancedMap component to avoid SSR issues
const EnhancedMapComponent = dynamic(
  () => import("@/components/EnhancedMap").then((mod) => ({ default: mod.EnhancedMap })), 
  { 
    ssr: false,
    loading: () => (
      <div className="h-96 w-full bg-gray-200 flex items-center justify-center rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <div className="text-lg text-gray-600">Loading Enhanced Map...</div>
        </div>
      </div>
    )
  }
);

// Memoize the component to prevent unnecessary re-renders
const MemoizedEnhancedMap = React.memo(EnhancedMapComponent);

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
              <p className="text-sm text-gray-600 mt-1">
                Discover amazing nature locations and start your green journey
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {session ? (
                <div className="text-sm text-gray-600">
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
                <MemoizedEnhancedMap />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
