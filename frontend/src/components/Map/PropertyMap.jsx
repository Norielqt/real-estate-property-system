import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { imgUrl } from '../../utils/imgUrl.js';

// Fix default marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const redPinIcon = () => L.divIcon({
  className: '',
  html: `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="40" viewBox="0 0 28 40">
    <path d="M14 0C6.268 0 0 6.268 0 14c0 9.333 14 26 14 26S28 23.333 28 14C28 6.268 21.732 0 14 0z"
      fill="#e02424" stroke="#b91c1c" stroke-width="1.5"/>
    <circle cx="14" cy="14" r="6" fill="#fff"/>
  </svg>`,
  iconSize: [28, 40],
  iconAnchor: [14, 40],
  popupAnchor: [0, -42],
});

function BoundsWatcher({ onBoundsChange }) {
  useMapEvents({
    moveend: (e) => {
      const b = e.target.getBounds();
      onBoundsChange?.(
        `${b.getSouth()},${b.getWest()},${b.getNorth()},${b.getEast()}`
      );
    },
  });
  return null;
}

export default function PropertyMap({ properties = [], className = '', onBoundsChange, center = [12.8797, 121.7740], zoom = 6 }) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={`map-container ${className}`}
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {onBoundsChange && <BoundsWatcher onBoundsChange={onBoundsChange} />}
      {properties
        .filter((p) => p.latitude && p.longitude)
        .map((p) => (
          <Marker
            key={p.id}
            position={[p.latitude, p.longitude]}
            icon={redPinIcon()}
          >
            <Popup maxWidth={250}>
              <div style={{ minWidth: 200 }}>
                {(p.cover_image || p.images?.[0]) && (
                  <img
                    src={imgUrl(p.cover_image ?? p.images?.[0]?.path ?? null)}
                    alt={p.title}
                    style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 4, marginBottom: 6 }}
                  />
                )}
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{p.title}</div>
                <div style={{ color: '#64748b', fontSize: 11, marginBottom: 6 }}>{p.city}, {p.state}</div>
                <Link
                  to={`/properties/${p.id}`}
                  style={{ background: '#003148', color: '#fff', padding: '4px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 }}
                >
                  View Details →
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
    </MapContainer>
  );
}
