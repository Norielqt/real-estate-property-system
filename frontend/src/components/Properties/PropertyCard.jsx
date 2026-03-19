import { Link } from 'react-router-dom';
import { Heart, MapPin, Bed, Bath, Ruler } from 'lucide-react';
import { favoritesApi } from '../../api/index.js';
import useAuthStore from '../../store/authStore.js';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { imgUrl } from '../../utils/imgUrl.js';

function typeLabel(type) {
  const map = { house: 'House', apartment: 'Apartment', condo: 'Condo', villa: 'Villa', studio: 'Studio', land: 'Land' };
  return map[type] || type;
}

function listingBadge(type) {
  return type === 'rent'
    ? <span className="badge badge-blue">For Rent</span>
    : <span className="badge badge-green">For Sale</span>;
}

function statusBadge(status) {
  if (status === 'available') return null;
  return <span className={`badge status-${status}`}>{status}</span>;
}

export default function PropertyCard({ property, onFavoriteToggle }) {
  const { user } = useAuthStore();
  const [favorited, setFavorited] = useState(property.is_favorited ?? false);
  const [favLoading, setFavLoading] = useState(false);

  const imgSrc = imgUrl(
    property.cover_image ?? property.images?.[0]?.path ?? null
  );

  const handleFav = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.error('Please log in to save properties.'); return; }
    setFavLoading(true);
    try {
      const { data } = await favoritesApi.toggle(property.id);
      setFavorited(data.favorited);
      toast.success(data.message);
      onFavoriteToggle?.(property.id, data.favorited);
    } catch {
      toast.error('Failed to update favorites.');
    } finally {
      setFavLoading(false);
    }
  };

  const formatPrice = (price, listingType) => {
    const formatted = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(price);
    return listingType === 'rent' ? <>{formatted}<span>/mo</span></> : formatted;
  };

  return (
    <Link to={`/properties/${property.id}`} className="property-card">
      <div className="property-card-img">
        <img src={imgSrc} alt={property.title} loading="lazy" />
        <div className="badges">
          {listingBadge(property.listing_type)}
          <span className="badge badge-gray">{typeLabel(property.type)}</span>
          {statusBadge(property.status)}
        </div>
        <button
          className={`fav-btn ${favorited ? 'active' : ''}`}
          onClick={handleFav}
          disabled={favLoading}
          title={favorited ? 'Remove from saved' : 'Save property'}
        >
          <Heart size={16} fill={favorited ? 'currentColor' : 'none'} />
        </button>
      </div>
      <div className="property-card-body">
        <div className="property-price">{formatPrice(property.price, property.listing_type)}</div>
        <div className="property-title truncate">{property.title}</div>
        <div className="property-address">
          <MapPin size={12} />
          {property.city}, {property.state}
        </div>
        {property.type !== 'land' && (
          <div className="property-specs">
            {property.bedrooms > 0 && (
              <span className="property-spec"><Bed size={13} />{property.bedrooms} bd</span>
            )}
            {property.bathrooms > 0 && (
              <span className="property-spec"><Bath size={13} />{property.bathrooms} ba</span>
            )}
            {property.area_sqft && (
              <span className="property-spec"><Ruler size={13} />{property.area_sqft.toLocaleString()} sqft</span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
