import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import styles from './MapPicker.module.css';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

const RecenterMap = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView(coords, map.getZoom());
    }
  }, [coords, map]);
  return null;
};

const MapPicker = ({ onLocationSelect, initialLocation, readOnly = false }) => {
  const defaultCoords = initialLocation
    ? [initialLocation.latitude ?? initialLocation[0], initialLocation.longitude ?? initialLocation[1]]
    : [13.0827, 80.2707];

  const [position, setPosition] = useState(defaultCoords);

  useEffect(() => {
    if (initialLocation) {
      const next = [
        initialLocation.latitude ?? initialLocation[0],
        initialLocation.longitude ?? initialLocation[1],
      ];
      if (Number.isFinite(next[0]) && Number.isFinite(next[1])) {
        setPosition(next);
      }
    }
  }, [initialLocation]);

  const LocationMarker = () => {
    useMapEvents({
      click(e) {
        if (readOnly) return;
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onLocationSelect?.({ latitude: lat, longitude: lng });
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
        <RecenterMap coords={position} />
        <LocationMarker />
      </MapContainer>
      {!readOnly && (
        <p className={styles.helpText}>Click anywhere on the map to pin the crisis coordinates.</p>
      )}
    </div>
  );
};

export default MapPicker;
