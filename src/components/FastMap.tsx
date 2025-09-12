/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useRef, useState } from "react";

interface NatureLocation {
  id: string;
  name: string;
  coordinates: [number, number];
  description?: string;
}

declare global {
  interface Window {
    startGreenTime: (locationId: string) => void;
  }
}

// Minimal map component with lazy loading
export const FastMap: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapReady, setMapReady] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadMap = async () => {
      try {
        // Lazy load Leaflet only when needed
        const L = await import("leaflet");
        
        if (!mounted || !containerRef.current || mapRef.current) return;

        // Create map immediately with default view
        const map = L.default.map(containerRef.current, {
          preferCanvas: true,
          zoomControl: true,
        }).setView([0, 0], 2);

        // Add minimal tile layer
        L.default.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 18,
          minZoom: 2,
        }).addTo(map);

        mapRef.current = map;
        setMapReady(true);
        setIsLoading(false);

        // Load additional features in background
        setTimeout(() => {
          if (mounted && map) {
            loadMapFeatures(L.default, map);
          }
        }, 100);

      } catch (error) {
        console.error("Map loading error:", error);
        setIsLoading(false);
      }
    };

    const loadMapFeatures = async (L: any, map: any) => {
      try {
        // Get user location in background
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              if (mounted && map) {
                const { latitude, longitude } = position.coords;
                map.setView([latitude, longitude], 13);
                
                L.marker([latitude, longitude])
                  .addTo(map)
                  .bindPopup("You are here!");
              }
            },
            () => {
              // Fallback to a default location
              if (mounted && map) {
                map.setView([40.7128, -74.0060], 10); // NYC
              }
            },
            { timeout: 5000, enableHighAccuracy: false }
          );
        }

        // Load nature locations in background
        const response = await fetch("/api/nature-locations");
        if (response.ok) {
          const locations = await response.json();
          
          if (mounted && map && locations?.length) {
            locations.forEach((location: NatureLocation) => {
              if (location.coordinates?.length >= 2) {
                L.marker(location.coordinates)
                  .addTo(map)
                  .bindPopup(`
                    <div class="p-2">
                      <h3 class="font-bold">${location.name}</h3>
                      <p class="text-sm">${location.description || ""}</p>
                      <button 
                        onclick="startGreenTime('${location.id}')"
                        class="mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        Start Green Time
                      </button>
                    </div>
                  `);
              }
            });
          }
        }
      } catch (error) {
        console.error("Error loading map features:", error);
      }
    };

    loadMap();

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto mb-2"></div>
          <div className="text-sm text-gray-600">Loading Map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] relative">
      {!mapReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 rounded-lg z-10">
          <div className="text-center">
            <div className="animate-pulse h-4 w-20 bg-gray-300 rounded mx-auto mb-2"></div>
            <div className="text-xs text-gray-500">Initializing...</div>
          </div>
        </div>
      )}
      <div 
        ref={containerRef} 
        className="w-full h-full rounded-lg border-2 border-gray-200"
      />
    </div>
  );
};

// Global function for green time (simplified)
if (typeof window !== "undefined") {
  window.startGreenTime = (locationId: string) => {
    console.log("Starting green time for location:", locationId);
    // Simplified implementation - could be enhanced later
    alert(`Green time started for location ${locationId}!`);
  };
}
