/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";

// Super fast map with instant interactive features
export const SuperFastMap: React.FC = () => {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  // Kenya nature locations (hardcoded for speed)
  const kenyaLocations = [
    { id: "1", name: "Uhuru Gardens", lat: -1.3095, lng: 36.7821, type: "park", activities: ["Walking", "Photography"] },
    { id: "2", name: "Karura Forest", lat: -1.2407, lng: 36.8283, type: "forest", activities: ["Hiking", "Bird Watching"] },
    { id: "3", name: "Ngong Hills", lat: -1.3667, lng: 36.6500, type: "hill", activities: ["Hiking", "Photography"] },
    { id: "4", name: "Lake Naivasha", lat: -0.7667, lng: 36.3500, type: "lake", activities: ["Boat Rides", "Bird Watching"] },
    { id: "5", name: "Diani Beach", lat: -4.2947, lng: 39.5772, type: "beach", activities: ["Swimming", "Snorkeling"] }
  ];

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
        () => setUserLocation({ lat: -1.2921, lng: 36.8219 }), // Nairobi fallback
        { timeout: 2000, enableHighAccuracy: false }
      );
    } else {
      setUserLocation({ lat: -1.2921, lng: 36.8219 });
    }
  }, []);

  const startGreenTime = (location: any) => {
    setSelectedLocation(location.id);
    setIsTracking(true);
    
    setTimeout(() => {
      alert(`🌱 Green Time Started at ${location.name}!

🇰🇪 Welcome to your nature session in Kenya
🌲 Location: ${location.name}
⏰ Timer: Now running
🎯 Activities: ${location.activities.join(", ")}

Enjoy your time in nature! 🦋`);
    }, 100);
  };

  const stopGreenTime = () => {
    setIsTracking(false);
    setSelectedLocation(null);
    alert("🏁 Green Time Session Completed!\n\nThank you for connecting with nature in Kenya! 🇰🇪");
  };

  // Interactive map using CSS and positioning (loads instantly)
  return (
    <div className="w-full h-full relative bg-gradient-to-br from-green-50 via-blue-50 to-green-100 rounded-lg overflow-hidden border-2 border-gray-200">
      {/* Map background with Kenya outline */}
      <div className="absolute inset-0">
        <svg className="w-full h-full" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="mapGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#22c55e" strokeWidth="0.5" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#mapGrid)" />
          
          {/* Simplified Kenya shape */}
          <path d="M100 80 L320 80 L340 120 L320 200 L300 280 L280 320 L200 340 L120 320 L100 280 L80 200 L90 120 Z" 
                fill="#dcfce7" stroke="#16a34a" strokeWidth="2" opacity="0.6"/>
          
          {/* Lake Victoria */}
          <circle cx="110" cy="180" r="15" fill="#3b82f6" opacity="0.7"/>
          
          {/* Indian Ocean */}
          <path d="M320 200 L340 220 L340 340 L320 340 Z" fill="#3b82f6" opacity="0.4"/>
        </svg>
      </div>

      {/* Location markers */}
      {kenyaLocations.map((location, index) => {
        const x = 120 + (index * 45) + (index % 2 * 20);
        const y = 120 + (index * 30) + (Math.sin(index) * 20);
        
        return (
          <div
            key={location.id}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110 ${
              selectedLocation === location.id ? 'scale-125 z-20' : 'z-10'
            }`}
            style={{ left: `${x}px`, top: `${y}px` }}
            onClick={() => startGreenTime(location)}
          >
            <div className={`w-8 h-8 rounded-full border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-xs ${
              location.type === 'forest' ? 'bg-green-600' :
              location.type === 'beach' ? 'bg-blue-500' :
              location.type === 'hill' ? 'bg-orange-500' :
              location.type === 'lake' ? 'bg-cyan-500' : 'bg-emerald-600'
            }`}>
              {location.type === 'forest' ? '🌲' :
               location.type === 'beach' ? '🏖️' :
               location.type === 'hill' ? '⛰️' :
               location.type === 'lake' ? '🏞️' : '🌳'}
            </div>
            
            {/* Location popup */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-white rounded-lg shadow-lg p-2 text-center whitespace-nowrap">
                <div className="font-semibold text-xs text-gray-800">{location.name}</div>
                <div className="text-xs text-gray-600">Click to start 🌱</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-white"></div>
              </div>
            </div>
          </div>
        );
      })}

      {/* User location marker */}
      {userLocation && (
        <div className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30"
             style={{ left: '200px', top: '200px' }}>
          <div className="w-6 h-6 bg-red-500 rounded-full border-2 border-white shadow-lg animate-pulse flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-red-600 whitespace-nowrap">
            You are here
          </div>
        </div>
      )}

      {/* Control panel */}
      <div className="absolute top-4 right-4 z-40 space-y-2">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <h3 className="font-bold text-sm text-gray-800 mb-2">🇰🇪 Kenya Nature Map</h3>
          <div className="text-xs text-gray-600 space-y-1">
            <div>• Click any location to start 🌱</div>
            <div>• {kenyaLocations.length} nature spots available</div>
            {isTracking && <div className="text-green-600 font-medium">• ⏰ Session Active!</div>}
          </div>
        </div>

        {isTracking && (
          <button
            onClick={stopGreenTime}
            className="w-full bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg shadow-lg text-xs font-medium transition-colors"
          >
            🛑 Stop Session
          </button>
        )}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-40">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
          <h4 className="font-semibold text-xs text-gray-800 mb-2">Legend</h4>
          <div className="space-y-1 text-xs">
            <div className="flex items-center gap-2">
              <span>🌲</span> <span>Forest</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🏖️</span> <span>Beach</span>
            </div>
            <div className="flex items-center gap-2">
              <span>⛰️</span> <span>Hills</span>
            </div>
            <div className="flex items-center gap-2">
              <span>🏞️</span> <span>Lake</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span> <span>Your Location</span>
            </div>
          </div>
        </div>
      </div>

      {/* Zoom controls */}
      <div className="absolute top-4 left-4 z-40 flex flex-col space-y-1">
        <button className="w-8 h-8 bg-white/90 hover:bg-white rounded shadow-lg flex items-center justify-center text-gray-700 font-bold text-sm">
          +
        </button>
        <button className="w-8 h-8 bg-white/90 hover:bg-white rounded shadow-lg flex items-center justify-center text-gray-700 font-bold text-sm">
          −
        </button>
      </div>
    </div>
  );
};
