import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'react-router-dom';
import { propertiesApi } from '../api/index.js';
import PropertyCard from '../components/Properties/PropertyCard.jsx';
import FilterPanel from '../components/Properties/FilterPanel.jsx';
import Pagination from '../components/Properties/Pagination.jsx';
import { LayoutGrid, List as ListIcon } from 'lucide-react';
import useAuthStore from '../store/authStore.js';

export default function PropertiesPage() {
  const { user } = useAuthStore();
  const [searchParams] = useSearchParams();

  const [filters, setFilters] = useState({
    search:       '',
    type:         searchParams.get('type') || '',
    listing_type: searchParams.get('listing_type') || '',
    city:         '',
    min_price:    '',
    max_price:    '',
    bedrooms:     '',
    bathrooms:    '',
    page:         1,
  });

  const [viewMode, setViewMode] = useState('grid');

  const queryFn = user
    ? () => propertiesApi.list({ ...filters }).then((r) => r.data)
    : () => propertiesApi.publicList({ ...filters }).then((r) => r.data);

  const { data, isLoading } = useQuery({
    queryKey: ['properties', filters],
    queryFn,
    keepPreviousData: true,
  });

  const properties = data?.data ?? [];
  const meta = data;

  return (
    <div className="page">
      <div className="container">
        <div className="section-header flex justify-between items-center">
          <div>
            <h2>Property Listings</h2>
            <p>{meta?.total ?? 0} properties found</p>
          </div>
          <div className="flex gap-2">
            <button
              className={`btn btn-sm ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setViewMode('grid')}
            ><LayoutGrid size={14} /></button>
            <button
              className={`btn btn-sm ${viewMode === 'list' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setViewMode('list')}
            ><ListIcon size={14} /></button>
          </div>
        </div>

        <FilterPanel filters={filters} onChange={setFilters} />

        {isLoading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : properties.length === 0 ? (
          <div className="empty-state">
            <h3>No properties found</h3>
            <p>Try adjusting your filters.</p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid-3' : ''} style={viewMode === 'list' ? { display: 'flex', flexDirection: 'column', gap: '1rem' } : {}}>
            {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
          </div>
        )}

        <Pagination
          meta={meta}
          onPageChange={(p) => setFilters({ ...filters, page: p })}
        />
      </div>
    </div>
  );
}
