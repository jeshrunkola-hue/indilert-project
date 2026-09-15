"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet's default icon missing issue in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const shelterIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const searchIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function RecenterAutomatically({ lat, lng, disabled }: { lat: number; lng: number, disabled: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!disabled) {
      map.setView([lat, lng], map.getZoom());
    }
  }, [lat, lng, map, disabled]);
  return null;
}

function MapFlyTo({ center }: { center: [number, number] | null }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 15, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

export default function MapComponent({ 
  showRouting = false,
  zoom = 14,
  searchedLocation = null,
  searchedName = ""
}: { 
  showRouting?: boolean,
  zoom?: number,
  searchedLocation?: [number, number] | null,
  searchedName?: string
}) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [shelterPos, setShelterPos] = useState<[number, number] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setPosition([25.5788, 91.8933]); // Fallback Shillong
      setShelterPos([25.5888, 91.9033]);
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setShelterPos([latitude + 0.005, longitude + 0.005]);
      },
      (err) => {
        console.warn("Geolocation error:", err);
        setPosition([25.5788, 91.8933]);
        setShelterPos([25.5888, 91.9033]);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  if (!position) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100/80 backdrop-blur-sm">
        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2"></div>
        <p className="text-slate-600 font-bold text-xs tracking-wide">Acquiring GPS Signal...</p>
      </div>
    );
  }

  return (
    <MapContainer 
      center={position} 
      zoom={zoom} 
      style={{ height: "100%", width: "100%", zIndex: 10 }}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      
      {/* Only auto-recenter on user if they haven't searched for something */}
      <RecenterAutomatically lat={position[0]} lng={position[1]} disabled={!!searchedLocation} />
      <MapFlyTo center={searchedLocation} />

      {/* User Location */}
      <Marker position={position}>
        <Popup>Your Current Location</Popup>
      </Marker>

      {/* Searched Location */}
      {searchedLocation && (
        <Marker position={searchedLocation} icon={searchIcon}>
          <Popup className="font-bold">{searchedName}</Popup>
        </Marker>
      )}

      {/* Conditional Routing & Shelter */}
      {showRouting && shelterPos && (
        <>
          <Marker position={shelterPos} icon={shelterIcon}>
            <Popup>Nearest Safe Shelter</Popup>
          </Marker>
          <Polyline 
            positions={[position, shelterPos]} 
            color="#3b82f6" 
            dashArray="8, 8" 
            weight={4}
          />
        </>
      )}
    </MapContainer>
  );
}
