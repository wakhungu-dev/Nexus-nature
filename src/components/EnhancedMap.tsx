import { useEffect, useState, useCallback, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Extend HTMLElement type to include leaflet map
declare global {
  interface Window {
    L: typeof L;
  }
}

// Custom icons for different nature types
const createCustomIcon = (type: string) => {
  const iconUrls = {
    park: "🌳",
    forest: "🌲",
    hill: "⛰️",
    lake: "🏞️",
    beach: "🏖️",
    user: "📍"
  };
  
  return L.divIcon({
    html: `<div style="font-size: 24px;">${iconUrls[type as keyof typeof iconUrls] || "🌿"}</div>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
  });
};

interface NatureLocation {
  id: string;
  name: string;
  type: 'park' | 'forest' | 'hill' | 'lake' | 'beach';
  coordinates: [number, number];
  description: string;
  activities?: string[];
}

const MapComponent = () => {
  const [center, setCenter] = useState<[number, number]>([
    -4.043477, 39.668205, // Default to Mombasa, Kenya
  ]);
  const [natureLocations, setNatureLocations] = useState<NatureLocation[]>([]);
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [error] = useState<string>('');
  const [isMapReady, setIsMapReady] = useState(false);
  const [mapKey, setMapKey] = useState(() => Date.now());
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Helper function to calculate distance between two points
  const calculateDistance = (pos1: [number, number], pos2: [number, number]): number => {
    const R = 6371; // Earth's radius in km
    const dLat = (pos2[0] - pos1[0]) * Math.PI / 180;
    const dLon = (pos2[1] - pos1[1]) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(pos1[0] * Math.PI / 180) * Math.cos(pos2[0] * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Function to check proximity to nature locations
  const checkProximityToNature = useCallback(async (userPos: [number, number]) => {
    if (natureLocations.length === 0) return;
    
    // Check if user is within 100m of any nature location
    const nearbyNature = natureLocations.find(location => {
      const distance = calculateDistance(userPos, location.coordinates);
      return distance < 0.1; // 100 meters
    });

    if (nearbyNature) {
      try {
        // Start logging green session
        await fetch('/api/green-sessions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            location: {
              type: 'Point',
              coordinates: userPos
            },
            source: 'gps',
            startTime: new Date()
          })
        });
      } catch (error) {
        console.error('Failed to log green session:', error);
      }
    }
  }, [natureLocations]);

  // Comprehensive cleanup function
  const cleanupMap = useCallback(() => {
    // Clear geolocation watch
    if (watchIdRef.current) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    // Clean up map instance
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      } catch (error) {
        console.warn('Error cleaning up map:', error);
      }
    }

    // Clean up any remaining leaflet containers
    if (containerRef.current) {
      const leafletContainers = containerRef.current.querySelectorAll('.leaflet-container');
      leafletContainers.forEach(container => {
        const mapInstance = (container as HTMLElement & { _leaflet_map?: L.Map })._leaflet_map;
        if (mapInstance) {
          try {
            mapInstance.remove();
          } catch (error) {
            console.warn('Error removing leaflet container:', error);
          }
        }
      });
    }
  }, []);

  // Initialize client-side rendering
  useEffect(() => {
    // Force cleanup of any existing maps before initialization
    cleanupMap();
    
    // Small delay to ensure cleanup is complete
    const timer = setTimeout(() => {
      setIsClient(true);
      setHasError(false);
    }, 50);
    
    return () => {
      clearTimeout(timer);
      cleanupMap();
    };
  }, [cleanupMap]);

  // Reset map on error
  const resetMap = useCallback(() => {
    setHasError(false);
    setIsClient(false);
    setIsMapReady(false);
    setMapKey(Date.now()); // Force new map instance
    cleanupMap();
    
    setTimeout(() => {
      setIsClient(true);
    }, 100);
  }, [cleanupMap]);

  // Fetch nature locations from API
  useEffect(() => {
    if (!isClient) return;

    const fetchNatureLocations = async () => {
      try {
        const response = await fetch('/api/nature-locations');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const locations = await response.json();
        setNatureLocations(locations);
        console.log('Loaded nature locations:', locations.length);
      } catch (error) {
        console.error('Failed to fetch nature locations:', error);
        // You might want to set some default locations here
      }
    };

    fetchNatureLocations();
  }, [isClient]);

  // Track user location
  useEffect(() => {
    if (!isClient || !isMapReady) return;

    const watchOptions: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    };

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position: GeolocationPosition) => {
        const { latitude, longitude } = position.coords;
        const newCenter: [number, number] = [latitude, longitude];
        
        setCenter(newCenter);
        setUserLocation(newCenter);
        
        // Log green session when user is near nature
        checkProximityToNature(newCenter);
      },
      (error) => {
        console.error('Geolocation error:', error);
        // Handle different error types
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.warn('User denied geolocation permission');
            break;
          case error.POSITION_UNAVAILABLE:
            console.warn('Location information unavailable');
            break;
          case error.TIMEOUT:
            console.warn('Location request timed out');
            break;
        }
      },
      watchOptions
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [isClient, isMapReady, checkProximityToNature]);



  // Show loading state until client-side rendering is ready
  if (!isClient) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-gray-100 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <div className="text-lg text-gray-600">Loading Enhanced Map...</div>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (hasError) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-red-50 rounded-lg border-2 border-red-200">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-12 h-12 mx-auto mb-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className="text-lg font-semibold">Map Loading Error</div>
          </div>
          <p className="text-gray-600 mb-4">There was an issue initializing the map.</p>
          <button
            onClick={resetMap}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="w-full h-[400px] relative"
      id={`enhanced-map-wrapper-${mapKey}`}
    >
      {error ? (
        <div className="flex items-center justify-center h-full bg-gray-100 rounded-lg">
          <div className="text-center">
            <p className="text-red-600 mb-2">Map loading error</p>
            <button 
              onClick={resetMap}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Retry Map
            </button>
          </div>
        </div>
      ) : (
        <MapContainer
          key={`enhanced-map-${mapKey}`}
          center={center}
          zoom={13}
          style={{ width: "100%", height: "400px" }}
          scrollWheelZoom={true}
          attributionControl={true}
          ref={(mapInstance) => {
            if (mapInstance) {
              mapInstanceRef.current = mapInstance;
              setIsMapReady(true);
            }
          }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* User location marker */}
          {userLocation && (
            <Marker position={userLocation} icon={createCustomIcon('user')}>
              <Popup>
                📍 Your current location
                <br />
                <small>Lat: {userLocation[0].toFixed(6)}, Lng: {userLocation[1].toFixed(6)}</small>
              </Popup>
            </Marker>
          )}

          {/* Nature location markers */}
          {natureLocations.map((location) => (
            <Marker 
              key={location.id} 
              position={location.coordinates}
              icon={createCustomIcon(location.type)}
            >
              <Popup>
                <div className="p-2">
                  <h3 className="font-bold text-green-700">{location.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{location.description}</p>
                  <div className="text-xs">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                      {location.type.charAt(0).toUpperCase() + location.type.slice(1)}
                    </span>
                  </div>
                  {location.activities && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold">Activities:</p>
                      <p className="text-xs">{location.activities.join(', ')}</p>
                    </div>
                  )}
                  <button 
                    className="mt-2 bg-green-500 text-white px-3 py-1 rounded text-xs hover:bg-green-600"
                    onClick={() => {
                      // Start a challenge or log visit
                      console.log(`Starting activity at ${location.name}`);
                    }}
                  >
                    Start Green Time
                  </button>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Proximity circles around nature locations */}
          {natureLocations.map((location) => (
            <Circle
              key={`circle-${location.id}`}
              center={location.coordinates}
              radius={100} // 100 meter radius
              pathOptions={{
                color: 'green',
                fillColor: 'lightgreen',
                fillOpacity: 0.1,
                weight: 1
              }}
            />
          ))}
        </MapContainer>
      )}
    </div>
  );
};

// Export with error boundary wrapper
export const EnhancedMap = () => {
  const [resetKey, setResetKey] = useState(Date.now());

  const handleReset = useCallback(() => {
    setResetKey(Date.now());
  }, []);

  try {
    return <MapComponent key={resetKey} />;
  } catch (error) {
    console.error('Map component error:', error);
    return (
      <div className="w-full h-[400px] flex items-center justify-center bg-red-50 rounded-lg border-2 border-red-200">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <div className="text-lg font-semibold">Map Error</div>
            <p className="text-sm mt-2">Map container initialization failed</p>
          </div>
          <button
            onClick={handleReset}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Reset Map
          </button>
        </div>
      </div>
    );
  }
};