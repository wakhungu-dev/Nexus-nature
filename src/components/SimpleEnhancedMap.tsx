"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default markers
interface LeafletIconDefault extends L.Icon.Default {
  _getIconUrl?: () => string;
}
delete (L.Icon.Default.prototype as LeafletIconDefault)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface NatureLocation {
  id: string;
  name: string;
  coordinates: [number, number];
  type: string;
  description: string;
  activities?: string[];
}

// Global map registry to prevent duplicates
const activeMapContainers = new Set<string>();

export const SimpleEnhancedMap: React.FC = () => {
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string>("");
  const [natureLocations, setNatureLocations] = useState<NatureLocation[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const containerId = useRef(`simple-map-${Date.now()}-${Math.random()}`);

  // Cleanup function
  const cleanup = () => {
    const id = containerId.current;
    activeMapContainers.delete(id);
    
    if (mapRef.current) {
      try {
        mapRef.current.remove();
        mapRef.current = null;
      } catch (e) {
        console.warn("Map cleanup error:", e);
      }
    }
    
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }
  };

  // Initialize map
  useEffect(() => {
    const id = containerId.current;
    
    // Prevent duplicate initialization
    if (activeMapContainers.has(id) || !containerRef.current) {
      return;
    }

    try {
      activeMapContainers.add(id);
      
      // Create map
      const map = L.map(containerRef.current, {
        center: [-1.2921, 36.8219], // Nairobi, Kenya
        zoom: 7,
        zoomControl: true,
        attributionControl: true,
      });

      // Add tile layer
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      mapRef.current = map;
      setIsLoaded(true);
      console.log("Simple map initialized successfully");

    } catch (error) {
      console.error("Map initialization error:", error);
      setError("Failed to initialize map");
      activeMapContainers.delete(id);
    }

    // Cleanup on unmount
    return cleanup;
  }, []);

  // Fetch nature locations
  useEffect(() => {
    if (!isLoaded) return;

    const fetchLocations = async () => {
      try {
        const response = await fetch("/api/nature-locations");
        if (response.ok) {
          const locations = await response.json();
          setNatureLocations(locations);
        }
      } catch (error) {
        console.error("Failed to fetch locations:", error);
      }
    };

    fetchLocations();
  }, [isLoaded]);

  // Get user location
  useEffect(() => {
    if (!isLoaded) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(coords);
        },
        (error) => {
          console.warn("Geolocation error:", error);
        }
      );
    }
  }, [isLoaded]);

  // Add markers to map
  useEffect(() => {
    if (!mapRef.current || !isLoaded) return;

    const map = mapRef.current;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    // Add user location marker
    if (userLocation) {
      const userMarker = L.marker(userLocation, {
        title: "Your Location",
      }).addTo(map);
      
      userMarker.bindPopup("📍 Your current location");
    }

    // Add nature location markers
    natureLocations.forEach((location) => {
      const marker = L.marker(location.coordinates, {
        title: location.name,
      }).addTo(map);

      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #16a34a; font-weight: bold;">${location.name}</h3>
          <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${location.description}</p>
          <div style="margin-bottom: 8px;">
            <span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
              ${location.type.charAt(0).toUpperCase() + location.type.slice(1)}
            </span>
          </div>
          ${location.activities ? `
            <div style="margin-bottom: 8px;">
              <strong style="font-size: 12px;">Activities:</strong><br>
              <span style="font-size: 12px; color: #666;">${location.activities.join(", ")}</span>
            </div>
          ` : ""}
          <button style="background: #16a34a; color: white; border: none; padding: 4px 12px; border-radius: 4px; font-size: 12px; cursor: pointer;">
            Start Green Time
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      // Add proximity circle
      L.circle(location.coordinates, {
        radius: 1000, // 1km radius
        color: "#16a34a",
        fillColor: "#dcfce7",
        fillOpacity: 0.1,
        weight: 1,
      }).addTo(map);
    });
  }, [natureLocations, userLocation, isLoaded]);

  if (error) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-red-50 rounded-lg border-2 border-red-200">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <div className="text-lg font-semibold">Map Error</div>
            <p className="text-sm mt-2">{error}</p>
          </div>
          <button
            onClick={() => {
              setError("");
              setIsLoaded(false);
              cleanup();
              window.location.reload();
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[400px] relative">
      <div
        ref={containerRef}
        id={containerId.current}
        className="w-full h-full rounded-lg"
        style={{ minHeight: "400px" }}
      />
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
            <div className="text-lg text-gray-600">Loading Map...</div>
          </div>
        </div>
      )}
    </div>
  );
};
