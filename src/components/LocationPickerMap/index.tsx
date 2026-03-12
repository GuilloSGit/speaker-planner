'use client';

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los iconos de leaflet en Next.js
const icon = L.icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12.5, 41],
});

interface LocationPickerMapProps {
    defaultLocation?: { lat: number; lng: number };
    onLocationSelect: (lat: number, lng: number) => void;
}

function LocationMarker({ position, onLocationSelect }: { position: L.LatLng | null, onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={icon}></Marker>
    );
}

export default function LocationPickerMap({ defaultLocation, onLocationSelect }: LocationPickerMapProps) {
    const [position, setPosition] = useState<L.LatLng | null>(
        defaultLocation ? new L.LatLng(defaultLocation.lat, defaultLocation.lng) : null
    );
    const [mapKey, setMapKey] = useState<string>('');

    // Workaround for strict-mode & fast-refresh leaflet bugs in Next.js 16+
    // Leaflet throws an error if it finds an already initialized container. Force a brand new one every mount.
    useEffect(() => {
        setMapKey(Math.random().toString(36).substring(7));
    }, []);

    const defaultCenter: [number, number] = [-31.5384286, -68.5129116];

    const handleLocationSelect = (lat: number, lng: number) => {
        setPosition(new L.LatLng(lat, lng));
        onLocationSelect(lat, lng);
    };

    if (!mapKey) {
        return <div className="h-48 w-full bg-gray-100 rounded-md animate-pulse p-4 flex items-center justify-center text-sm text-gray-500">Inicializando mapa...</div>
    }

    return (
        <div className="h-48 w-full rounded-md overflow-hidden border border-gray-300 relative z-0">
            <MapContainer
                key={mapKey}
                center={position || defaultCenter}
                zoom={13}
                scrollWheelZoom={true}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker position={position} onLocationSelect={handleLocationSelect} />
            </MapContainer>
        </div>
    );
}
