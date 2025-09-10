"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";

// Fix Leaflet's default marker icons for Next.js
interface IconDefault extends L.Icon.Default {
  _getIconUrl?: () => string;
}
delete (L.Icon.Default.prototype as IconDefault)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "/leaflet/images/marker-icon.png",
  iconUrl: "/leaflet/images/marker-icon.png", 
  shadowUrl: "/leaflet/images/marker-shadow.png",
});

export default function SimpleLeafletMap() {
  const position: [number, number] = [40.7829, -73.9654]; // Central Park

  return (
    <MapContainer
      key={`simple-map-${Date.now()}`}
      center={position}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      className="rounded"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
      />
      <Marker position={position}>
        <Popup>
          <div className="text-sm">
            <strong>🏞️ Central Park</strong><br />
            Simple test marker
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
