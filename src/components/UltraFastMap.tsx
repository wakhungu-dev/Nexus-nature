/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";

// Ultra-fast map component that shows immediately
export const UltraFastMap: React.FC = () => {
  const [mapStage, setMapStage] = useState<'static' | 'loading' | 'interactive'>('static');
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    let mounted = true;
    
    // Start loading interactive map after a short delay
    const timer = setTimeout(() => {
      if (mounted) {
        setMapStage('loading');
        loadInteractiveMap();
      }
    }, 200);

    const loadInteractiveMap = async () => {
      try {
        // Dynamic import of Leaflet
        const L = await import("leaflet");
        
        if (!mounted || !containerRef.current) return;

        // Clear the static content
        containerRef.current.innerHTML = '';

                // Create map immediately with default view (Nairobi, Kenya)
        const map = L.default.map(containerRef.current, {
          preferCanvas: true,
          zoomControl: true,
        }).setView([-1.2921, 36.8219], 10);

        // Add tiles
        L.default.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          minZoom: 3,
        }).addTo(map);

        mapRef.current = map;
        setMapStage('interactive');

        // Load user location and nature spots in background
        loadMapData(L.default, map);

      } catch (error) {
        console.error("Failed to load interactive map:", error);
        setMapStage('static'); // Fallback to static
      }
    };

    const loadMapData = async (L: any, map: any) => {
      // Get user location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            if (mounted && map) {
              const { latitude, longitude } = position.coords;
              map.setView([latitude, longitude], 13);
              L.marker([latitude, longitude])
                .addTo(map)
                .bindPopup("📍 You are here!");
            }
          },
          () => console.log("Geolocation failed"),
          { timeout: 3000, enableHighAccuracy: false }
        );
      }

      // Load nature locations
      try {
        const response = await fetch("/api/nature-locations");
        if (response.ok) {
          const locations = await response.json();
          locations?.forEach((location: any) => {
            if (location.coordinates?.length >= 2) {
              L.marker(location.coordinates)
                .addTo(map)
                .bindPopup(`
                  <div class="p-2 max-w-xs">
                    <h3 class="font-bold text-sm">${location.name}</h3>
                    <p class="text-xs text-gray-600 mb-2">${location.description || ""}</p>
                    <button 
                      onclick="startGreenTime('${location.id}')"
                      class="px-2 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                    >
                      🌱 Start Green Time
                    </button>
                  </div>
                `);
            }
          });
        }
      } catch (error) {
        console.error("Failed to load nature locations:", error);
      }
    };

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Static map view (shows immediately)
  if (mapStage === 'static') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-green-100 to-blue-100 rounded-lg border-2 border-gray-200 relative overflow-hidden">
        {/* Fake map background */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-gray-300 relative">
            {/* Grid pattern to simulate map */}
            <svg className="w-full h-full" viewBox="0 0 400 400">
              <defs>
                <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                  <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#666" strokeWidth="1" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
        </div>
        
        {/* Loading indicator */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <div className="flex items-center space-x-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-green-600"></div>
              <span className="text-sm font-medium text-gray-700">Initializing Map...</span>
            </div>
          </div>
        </div>

        {/* Fake markers */}
        <div className="absolute top-1/3 left-1/2 w-4 h-4 bg-red-500 rounded-full border-2 border-white shadow-lg transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/3 w-3 h-3 bg-green-500 rounded-full border border-white shadow"></div>
        <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-blue-500 rounded-full border border-white shadow"></div>
      </div>
    );
  }

  // Loading interactive map
  if (mapStage === 'loading') {
    return (
      <div className="w-full h-full bg-gray-100 rounded-lg border-2 border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse h-4 w-24 bg-gray-300 rounded mx-auto mb-2"></div>
          <div className="text-xs text-gray-500">Loading Interactive Map...</div>
        </div>
      </div>
    );
  }

  // Interactive map container
  return (
    <div 
      ref={containerRef} 
      className="w-full h-full rounded-lg border-2 border-gray-200"
    />
  );
};

// Global function for green time
if (typeof window !== "undefined") {
  (window as any).startGreenTime = (locationId: string) => {
    console.log("Starting green time for location:", locationId);
    alert(`🌱 Green time started for location ${locationId}!\n\nEnjoy your time in nature! 🌲`);
  };
}
