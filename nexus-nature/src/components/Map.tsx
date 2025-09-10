"use client";

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { useState } from "react";

// ✅ Fix Leaflet's default marker icons (Next.js needs manual config)
interface LeafletIconPrototype extends L.Icon.Default {
  _getIconUrl?: () => string;
}
delete (L.Icon.Default.prototype as LeafletIconPrototype)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/images/marker-icon.png",
  iconUrl: "/leaflet/images/marker-icon.png",
  shadowUrl: "/leaflet/images/marker-shadow.png",
});

// Component to handle map clicks
function LocationMarker({ onAdd }: { onAdd: (latlng: { lat: number; lng: number }) => void }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onAdd({ lat, lng });
    },
  });
  return null;
}

export default function Map() {
  const [locations, setLocations] = useState<{ lat: number; lng: number }[]>([]);

  const handleAddLocation = (latlng: { lat: number; lng: number }) => {
    setLocations((prev) => [...prev, latlng]);
  };

  return (
    <div className="h-screen w-full">
      <MapContainer
        center={[51.505, -0.09]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        />
        <LocationMarker onAdd={handleAddLocation} />

        {/* Render all collected markers */}
        {locations.map((loc, i) => (
          <Marker key={i} position={[loc.lat, loc.lng]}>
            <Popup>
              📍 Marker {i + 1}
              <br />
              {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Floating box with all selected points */}
      {locations.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white p-2 rounded shadow max-h-40 overflow-y-auto">
          <h4 className="font-semibold">Selected Locations:</h4>
          <ul className="text-sm">
            {locations.map((loc, i) => (
              <li key={i}>
                {i + 1}. {loc.lat.toFixed(4)}, {loc.lng.toFixed(4)}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
