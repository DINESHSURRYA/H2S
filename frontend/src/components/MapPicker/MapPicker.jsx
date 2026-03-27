import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import styles from './MapPicker.module.css';

// Fix for default marker icons in Leaflet with React/Vite
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const MapPicker = ({ onLocationSelect, initialLocation }) => {
  const [position, setPosition] = useState(initialLocation || [12.9716, 77.5946]); // Default to Bangalore/India or similar center

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onLocationSelect({ latitude: lat, longitude: lng });
      },
    });

    return position ? <Marker position={position} /> : null;
  };

  return (
    <div className={styles.mapWrapper}>
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={true} 
        className={styles.mapContainer}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker />
      </MapContainer>
      <p className={styles.helpText}>Click on the map to pin your location.</p>
    </div>
  );
};

export default MapPicker;
