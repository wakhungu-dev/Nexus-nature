"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet's default markers
interface LeafletIconDefault extends L.Icon.Default {
  _getIconUrl?: () => string;
}

interface ExtendedMarker extends L.Marker {
  isUserMarker?: boolean;
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
  const { data: session } = useSession();
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string>("");
  const [natureLocations, setNatureLocations] = useState<NatureLocation[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [activeSession, setActiveSession] = useState<{
    sessionId: string;
    startTime: Date;
    location: NatureLocation;
  } | null>(null);
  const [sessionDuration, setSessionDuration] = useState<number>(0);
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
  };

  // Green session management functions
  const startGreenSession = useCallback(async (location: NatureLocation) => {
    if (!session?.user?.email) {
      alert("Please sign in to start a green session!");
      return;
    }

    if (activeSession) {
      alert("You already have an active session! Please end it first.");
      return;
    }

    try {
      const response = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lng: location.coordinates[0],
          lat: location.coordinates[1],
          source: "map",
          startTime: new Date().toISOString(),
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setActiveSession({
          sessionId: data.session._id,
          startTime: new Date(),
          location: location,
        });
        setSessionDuration(0);
        alert(`🌿 Green session started at ${location.name}!`);
      } else {
        throw new Error(data.error || "Failed to start session");
      }
    } catch (error) {
      console.error("Failed to start green session:", error);
      alert("Failed to start green session. Please try again.");
    }
  }, [session, activeSession]);

  const endGreenSession = useCallback(async () => {
    if (!activeSession) return;

    try {
      // Calculate duration in minutes
      const duration = Math.floor((Date.now() - activeSession.startTime.getTime()) / 60000);
      
      const response = await fetch("/api/sessions", {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lng: activeSession.location.coordinates[0],
          lat: activeSession.location.coordinates[1],
          source: "map",
          startTime: activeSession.startTime.toISOString(),
          endTime: new Date().toISOString(),
          duration: duration,
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        alert(`🎉 Green session completed! Duration: ${duration} minutes at ${activeSession.location.name}`);
        setActiveSession(null);
        setSessionDuration(0);
      } else {
        throw new Error(data.error || "Failed to end session");
      }
    } catch (error) {
      console.error("Failed to end green session:", error);
      alert("Failed to end green session. Please try again.");
    }
  }, [activeSession]);

  // Timer effect for active sessions
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (activeSession) {
      interval = setInterval(() => {
        const duration = Math.floor((Date.now() - activeSession.startTime.getTime()) / 1000);
        setSessionDuration(duration);
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeSession]);

  // Fetch nature locations with loading state
  useEffect(() => {
    const fetchNatureLocations = async () => {
      try {
        const response = await fetch("/api/nature-locations");
        const data = await response.json();
        setNatureLocations(data || []); // Fix: data is already the array, not nested
      } catch (error) {
        console.error("Error fetching nature locations:", error);
        setError("Failed to load nature locations");
      }
    };

    fetchNatureLocations();
  }, []);

  // Get user location (non-blocking, happens in background)
  useEffect(() => {
    if (navigator.geolocation) {
      const geoOptions = {
        timeout: 10000, // 10 second timeout
        maximumAge: 300000, // 5 minute cache
        enableHighAccuracy: false, // Faster, less precise
      };
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([position.coords.longitude, position.coords.latitude]);
        },
        (error) => {
          console.warn("Geolocation error:", error);
          // Don't show error to user, just continue without location
        },
        geoOptions
      );
    }
  }, []);

  // Initialize map immediately, don't wait for user location
  useEffect(() => {
    if (!isLoaded && containerRef.current) {
      const id = containerId.current;
      
      // Check if container is already active
      if (activeMapContainers.has(id)) {
        console.warn(`Map container ${id} already exists`);
        return;
      }

      try {
        // Clear any existing map
        if (mapRef.current) {
          mapRef.current.remove();
          mapRef.current = null;
        }

        // Register container
        activeMapContainers.add(id);

        // Create new map with default center (faster than waiting for geolocation)
        const map = L.map(containerRef.current, {
          center: [0.3476, 32.5825], // Default to Kampala
          zoom: 6,
          zoomControl: true,
          scrollWheelZoom: true,
          preferCanvas: true, // Better performance for many markers
        });

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
          minZoom: 5,
        }).addTo(map);

        mapRef.current = map;
        setIsLoaded(true);
      } catch (error) {
        console.error("Map initialization error:", error);
        setError("Failed to initialize map");
        activeMapContainers.delete(id);
      }
    }
  }, [isLoaded]);

  // Add user location marker when available (separate from map init)
  useEffect(() => {
    if (!mapRef.current || !isLoaded || !userLocation) return;

    const map = mapRef.current;
    
    // Remove existing user marker if any
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && (layer as ExtendedMarker).isUserMarker) {
        map.removeLayer(layer);
      }
    });

    const userIcon = L.divIcon({
      html: '<div style="background: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
      className: '',
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    const userMarker = L.marker([userLocation[1], userLocation[0]], { icon: userIcon })
      .addTo(map)
      .bindPopup("📍 Your Location");
    
    // Mark as user marker for removal
    (userMarker as ExtendedMarker).isUserMarker = true;

    // Zoom to user location
    map.setView([userLocation[1], userLocation[0]], 13);
  }, [userLocation, isLoaded]);

  // Add nature location markers efficiently 
  useEffect(() => {
    if (!mapRef.current || !isLoaded || natureLocations.length === 0) return;

    const map = mapRef.current;

    // Remove existing nature markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker && !(layer as ExtendedMarker).isUserMarker) {
        map.removeLayer(layer);
      }
      if (layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    // Add nature location markers efficiently
    natureLocations.forEach((location) => {
      const marker = L.marker(location.coordinates, {
        title: location.name,
      }).addTo(map);

      const isActiveLocation = activeSession?.location.id === location.id;

      // Simplified popup content for better performance
      const popupContent = `
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 8px 0; color: #16a34a; font-weight: bold;">${location.name}</h3>
          <p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${location.description}</p>
          <div style="margin-bottom: 8px;">
            <span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 4px; font-size: 12px;">
              ${location.type.charAt(0).toUpperCase() + location.type.slice(1)}
            </span>
          </div>
          ${isActiveLocation ? `
            <div style="margin-bottom: 8px; padding: 4px 8px; background: #16a34a; color: white; border-radius: 4px; font-size: 12px; text-align: center;">
              🟢 Active Session: ${Math.floor(sessionDuration / 60)}:${(sessionDuration % 60).toString().padStart(2, '0')}
            </div>
            <button 
              onclick="window.endGreenSession()" 
              style="background: #dc2626; color: white; border: none; padding: 4px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; width: 100%;"
            >
              End Session
            </button>
          ` : `
            <button 
              onclick="window.startGreenSession('${location.id}')" 
              style="background: #16a34a; color: white; border: none; padding: 4px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; width: 100%;"
            >
              Start Green Time
            </button>
          `}
        </div>
      `;

      marker.bindPopup(popupContent);

      // Add proximity circle
      L.circle(location.coordinates, {
        radius: 1000,
        color: isActiveLocation ? "#16a34a" : "#16a34a",
        fillColor: isActiveLocation ? "#16a34a" : "#dcfce7",
        fillOpacity: isActiveLocation ? 0.3 : 0.1,
        weight: isActiveLocation ? 3 : 1,
      }).addTo(map);
    });

    // Expose functions to window for popup buttons
    const windowWithFunctions = window as Window & {
      startGreenSession?: (locationId: string) => void;
      endGreenSession?: () => void;
    };
    windowWithFunctions.startGreenSession = (locationId: string) => {
      const location = natureLocations.find(l => l.id === locationId);
      if (location) {
        startGreenSession(location);
      }
    };

    windowWithFunctions.endGreenSession = endGreenSession;
  }, [natureLocations, isLoaded, activeSession, sessionDuration, startGreenSession, endGreenSession]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
      // Clean up window functions
      const windowWithFunctions = window as Window & {
        startGreenSession?: (locationId: string) => void;
        endGreenSession?: () => void;
      };
      delete windowWithFunctions.startGreenSession;
      delete windowWithFunctions.endGreenSession;
    };
  }, []);

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

  if (!isLoaded) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-gray-200">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Active session indicator */}
      {activeSession && (
        <div className="absolute top-4 left-4 z-[1000] bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <div className="text-sm font-medium">
              🌿 Active at {activeSession.location.name}
            </div>
          </div>
          <div className="text-xs">
            Duration: {Math.floor(sessionDuration / 60)}:{(sessionDuration % 60).toString().padStart(2, '0')}
          </div>
        </div>
      )}

      {/* Session controls */}
      {activeSession && (
        <div className="absolute top-4 right-4 z-[1000]">
          <button
            onClick={endGreenSession}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-lg transition-colors text-sm font-medium"
          >
            End Session
          </button>
        </div>
      )}

      <div 
        ref={containerRef} 
        className="w-full h-[400px] rounded-lg border-2 border-gray-200"
      />
    </div>
  );
};
