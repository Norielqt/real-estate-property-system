import { useQuery } from '@tanstack/react-query';
import { favoritesApi } from '../api/index.js';
import PropertyCard from '../components/Properties/PropertyCard.jsx';
import { Heart } from 'lucide-react';

export default function FavoritesPage() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['favorites'],
    queryFn:  () => favoritesApi.list().then((r) => r.data),
  });

  const properties = data?.data ?? [];

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <h2>Saved Properties</h2>
          <p>{properties.length} saved listing{properties.length !== 1 ? 's' : ''}</p>
        </div>

        {isLoading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : properties.length === 0 ? (
          <div className="empty-state">
            <Heart size={48} />
            <h3>No saved properties</h3>
            <p>Click the heart icon on any listing to save it here.</p>
          </div>
        ) : (
          <div className="grid-3">
            {properties.map((p) => (
              <PropertyCard
                key={p.id}
                property={{ ...p, is_favorited: true }}
                onFavoriteToggle={() => refetch()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
