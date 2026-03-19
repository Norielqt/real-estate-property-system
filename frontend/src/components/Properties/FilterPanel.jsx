import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const PROPERTY_TYPES   = [['', 'All Types'], ['house', 'House'], ['apartment', 'Apartment'], ['condo', 'Condo'], ['villa', 'Villa'], ['studio', 'Studio'], ['land', 'Land']];
const LISTING_TYPES    = [['', 'Buy or Rent'], ['sale', 'For Sale'], ['rent', 'For Rent']];
const BEDROOM_OPTIONS  = [['', 'Any Beds'], ['1', '1+'], ['2', '2+'], ['3', '3+'], ['4', '4+']];
const BATHROOM_OPTIONS = [['', 'Any Baths'], ['1', '1+'], ['2', '2+'], ['3', '3+']];

export default function FilterPanel({ filters, onChange }) {
  const [expanded, setExpanded] = useState(false);

  const set = (key, val) => onChange({ ...filters, [key]: val, page: 1 });

  const clear = () => onChange({ search: '', type: '', listing_type: '', min_price: '', max_price: '', bedrooms: '', bathrooms: '', city: '', page: 1 });

  const activeCount = Object.entries(filters).filter(([k, v]) => v && k !== 'page').length;

  return (
    <div className="filter-panel mb-4">
      {/* Search row */}
      <div className="search-bar mb-4">
        <Search size={18} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search by title, address, or city…"
          value={filters.search}
          onChange={(e) => set('search', e.target.value)}
        />
        <button className="btn btn-primary btn-sm">Search</button>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => setExpanded(!expanded)}
        >
          <SlidersHorizontal size={14} />
          Filters {activeCount > 0 && <span className="badge badge-blue">{activeCount}</span>}
        </button>
      </div>

      {expanded && (
        <>
          <div className="filter-row">
            <div className="filter-group">
              <label>Type</label>
              <select value={filters.type} onChange={(e) => set('type', e.target.value)}>
                {PROPERTY_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Listing</label>
              <select value={filters.listing_type} onChange={(e) => set('listing_type', e.target.value)}>
                {LISTING_TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>City</label>
              <input type="text" placeholder="e.g. Makati" value={filters.city} onChange={(e) => set('city', e.target.value)} />
            </div>
            <div className="filter-group">
              <label>Bedrooms</label>
              <select value={filters.bedrooms} onChange={(e) => set('bedrooms', e.target.value)}>
                {BEDROOM_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Bathrooms</label>
              <select value={filters.bathrooms} onChange={(e) => set('bathrooms', e.target.value)}>
                {BATHROOM_OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="filter-row">
            <div className="filter-group">
              <label>Min Price (₱)</label>
              <input type="number" placeholder="0" value={filters.min_price} onChange={(e) => set('min_price', e.target.value)} />
            </div>
            <div className="filter-group">
              <label>Max Price (₱)</label>
              <input type="number" placeholder="Any" value={filters.max_price} onChange={(e) => set('max_price', e.target.value)} />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button className="btn btn-ghost btn-sm" onClick={clear}>
                <X size={14} /> Clear All
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
