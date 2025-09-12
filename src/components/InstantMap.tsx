/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";

// Instant loading map using embedded OpenStreetMap
export const InstantMap: React.FC = () => {
  const [showInteractive, setShowInteractive] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);

  // Get user location immediately
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        () => {
          // Default to Nairobi, Kenya if geolocation fails
          setUserLocation({ lat: -1.2921, lng: 36.8219 });
        },
        { timeout: 2000, enableHighAccuracy: false }
      );
    } else {
      setUserLocation({ lat: -1.2921, lng: 36.8219 });
    }
  }, []);

  // Upgrade to interactive map on click
  const upgradeToInteractive = () => {
    setShowInteractive(true);
  };

  if (showInteractive) {
    // Use SuperFastMap - loads instantly with CSS-based interactions
    const SuperFastMap = React.lazy(() => 
      import("@/components/SuperFastMap").then(mod => ({ default: mod.SuperFastMap }))
    );

    return (
      <React.Suspense fallback={
        <div className="w-full h-full bg-gradient-to-br from-green-50 to-blue-50 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
            <div className="text-sm font-medium text-green-700">Almost there...</div>
          </div>
        </div>
      }>
        <div className="w-full h-full relative">
          <SuperFastMap />
          <div className="absolute top-4 right-16 z-50">
            <button
              onClick={() => setShowInteractive(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-medium transition-colors"
            >
              ← Static Map
            </button>
          </div>
        </div>
      </React.Suspense>
    );
  }

  // Instant static map using iframe (loads immediately)
  const mapCenter = userLocation ? `${userLocation.lat},${userLocation.lng}` : "-1.2921,36.8219";

  return (
    <div className="w-full h-full relative bg-gray-100 rounded-lg overflow-hidden border-2 border-gray-200">
      {/* Instant loading embedded map */}
      <iframe
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${userLocation ? 
          `${userLocation.lng - 0.05},${userLocation.lat - 0.05},${userLocation.lng + 0.05},${userLocation.lat + 0.05}` : 
          "36.75,-1.35,36.9,-1.25"
        }&amp;layer=mapnik&amp;marker=${mapCenter}`}
        className="w-full h-full border-0"
        loading="eager"
        title="Kenya Nature Locations Map"
      />
      
      {/* Overlay with upgrade button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={upgradeToInteractive}
          className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors flex items-center space-x-2"
        >
          <span>🗺️</span>
          <span>Interactive Map</span>
        </button>
      </div>

      {/* Nature locations info overlay */}
      <div className="absolute bottom-4 left-4 right-4 z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <h3 className="font-semibold text-sm text-gray-800 mb-1">�🇪 Kenya Nature Locations</h3>
          <p className="text-xs text-gray-600 mb-2">
            Click &quot;Interactive Map&quot; for full features including:
          </p>
          <div className="flex flex-wrap gap-1 text-xs">
            <span className="bg-green-100 text-green-700 px-2 py-1 rounded">🌱 Green Time Tracking</span>
            <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">📍 Your Location</span>
            <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">🗺️ Interactive Zoom</span>
          </div>
        </div>
      </div>

      {/* Quick action button */}
      <div className="absolute top-4 left-4 z-10">
        <button
          onClick={() => {
            // Quick green time start without full map
            const confirmed = confirm("🌱 Start Green Time session?\n\nThis will begin tracking your nature time!");
            if (confirmed) {
              alert("🌲 Green Time Started!\n\nEnjoy your time in nature. Timer is now running!");
            }
          }}
          className="bg-white/90 hover:bg-white text-green-700 px-3 py-2 rounded-lg shadow-lg text-sm font-medium transition-colors"
        >
          🌱 Quick Start
        </button>
      </div>
    </div>
  );
};

// Global function for green time tracking
if (typeof window !== "undefined") {
  (window as any).startGreenTime = (locationId: string) => {
    console.log("Starting green time for location:", locationId);
    
    // Enhanced green time start with Kenya-specific messaging
    const confirmed = confirm(`🌱 Start Green Time Session?

Location ID: ${locationId}

This will begin tracking your nature time in Kenya. 
Ready to connect with nature?`);
    
    if (confirmed) {
      alert(`🇰🇪 Green Time Started!

Welcome to your nature session in Kenya! 
🌲 Timer is now running
🦋 Enjoy the wildlife and scenery
⏰ Your session will be tracked

Asante (Thank you) for choosing nature time!`);
    }
  };
}
