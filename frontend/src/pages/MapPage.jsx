import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { propertiesApi } from '../api/index.js';
import PropertyMap from '../components/Map/PropertyMap.jsx';
import FilterPanel from '../components/Properties/FilterPanel.jsx';
import useAuthStore from '../store/authStore.js';
import { MapPin, Bed, Bath } from 'lucide-react';
import { imgUrl } from '../utils/imgUrl.js';

export default function MapPage() {
  const { user } = useAuthStore();
  const [filters, setFilters] = useState({ search: '', type: '', listing_type: '', city: '', min_price: '', max_price: '', bedrooms: '', page: 1, per_page: 100 });
  const [bounds, setBounds] = useState(null);
  const [selected, setSelected] = useState(null);

  const queryFn = user
    ? () => propertiesApi.list({ ...filters, bounds }).then((r) => r.data)
    : () => propertiesApi.publicList({ ...filters, bounds }).then((r) => r.data);

  const { data, isLoading } = useQuery({
    queryKey: ['map-properties', filters, bounds],
    queryFn,
    keepPreviousData: true,
  });

  const properties = data?.data ?? [];

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <h2>Explore on Map</h2>
          <p>Pan and zoom the map to find properties in any area. Click a pin for details.</p>
        </div>

        <FilterPanel filters={filters} onChange={setFilters} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}>
          <div>
            <PropertyMap
              properties={properties}
              className="fullscreen"
              onBoundsChange={setBounds}
              center={[12.8797, 121.7740]}
              zoom={6}
            />
          </div>

          <div className="map-sidebar">
            <div className="map-sidebar-header">
              {isLoading ? 'Loading…' : `${properties.length} propert${properties.length === 1 ? 'y' : 'ies'} in view`}
            </div>
            {properties.map((p) => (
              <Link key={p.id} to={`/properties/${p.id}`} className="map-sidebar-item">
                <img
                  src={imgUrl(p.cover_image ?? p.images?.[0]?.path ?? null)}
                  alt={p.title}
                  className="map-sidebar-thumb"
                />
                <div className="map-sidebar-info">
                  <div className="map-sidebar-price">
                    {new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(p.price)}
                    {p.listing_type === 'rent' && <span>/mo</span>}
                  </div>
                  <div className="map-sidebar-title">{p.title}</div>
                  <div className="map-sidebar-meta">
                    <MapPin size={11} />{p.city}
                    {p.bedrooms > 0 && <><Bed size={11} />{p.bedrooms}bd</>}
                    {p.bathrooms > 0 && <><Bath size={11} />{p.bathrooms}ba</>}
                  </div>
                </div>
                <span className={`map-sidebar-badge ${p.listing_type === 'rent' ? 'badge-blue' : 'badge-green'}`}>
                  {p.listing_type === 'rent' ? 'Rent' : 'Sale'}
                </span>
              </Link>
            ))}
            {properties.length === 0 && !isLoading && (
              <div className="empty-state"><p>No properties found in this area.</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
