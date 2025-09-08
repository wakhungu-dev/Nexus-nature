"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customMarker = new L.Icon({
  iconUrl: "/images/marker-icon.png",
  shadowUrl: "/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

function LocationMarker({ setPosition }: { setPosition: (pos: [number, number]) => void }) {
  useMapEvents({
    click(e) {
      setPosition([e.latlng.lat, e.latlng.lng]);
    },
  });
  return null;
}

export default function MapPage() {
  const [position, setPosition] = useState<[number, number] | null>(null);

  const activities = [
    { id: "act1", name: "Scuba Diving", lat: 25.0365, lng: -77.398 },
    { id: "act2", name: "Kayaking", lat: 20.799, lng: -156.33 },
    { id: "act3", name: "Surfing", lat: -17.715, lng: 178.066 },
  ];

  async function logSession(lat: number, lng: number, activityId: string) {
    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat, lng, activityId }),
    });
  }

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">🌍 Explore Map</h1>
      <MapContainer center={[20, 0]} zoom={2} className="h-[400px] w-full rounded-xl">
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {position && <Marker position={position} icon={customMarker}><Popup>Your Location</Popup></Marker>}
        <LocationMarker setPosition={setPosition} />
      </MapContainer>

      {position && (
        <ul className="mt-4 space-y-2">
          {activities.map(a => (
            <li
              key={a.id}
              onClick={() => logSession(a.lat, a.lng, a.id)}
              className="cursor-pointer p-2 bg-gray-100 rounded hover:bg-gray-200"
            >
              🎯 {a.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
