import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import L from 'leaflet';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function ClickMarker({ onSelect }) {
  const [pos, setPos] = useState(null);

  useMapEvents({
    click(e) {
      setPos(e.latlng);
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return pos ? <Marker position={pos} /> : null;
}

export default function LocationPicker({ lat, lng, onChange }) {
  const center = lat && lng ? [lat, lng] : [14.5995, 120.9842]; // Manila default

  return (
    <div>
      <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', marginBottom: '.5rem' }}>
        Click on the map to set the property location.
      </p>
      <MapContainer center={center} zoom={lat ? 14 : 7} style={{ height: 300, borderRadius: 8, zIndex: 0 }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickMarker onSelect={onChange} />
        {lat && lng && <Marker position={[lat, lng]} />}
      </MapContainer>
      {lat && lng && (
        <p style={{ fontSize: '.75rem', color: 'var(--text-muted)', marginTop: '.35rem' }}>
          📍 {parseFloat(lat).toFixed(6)}, {parseFloat(lng).toFixed(6)}
        </p>
      )}
    </div>
  );
}
