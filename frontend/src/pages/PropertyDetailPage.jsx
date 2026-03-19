import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propertiesApi, bookingsApi, favoritesApi } from '../api/index.js';
import {
  MapPin, Bed, Bath, Ruler, Car, Heart, Calendar,
  CheckCircle2, ChevronLeft, Pencil, Trash2, User,
} from 'lucide-react';
import { useState } from 'react';
import PropertyMap from '../components/Map/PropertyMap.jsx';
import useAuthStore from '../store/authStore.js';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import { imgUrl } from '../utils/imgUrl.js';

function BookingForm({ property }) {
  const { user } = useAuthStore();
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: { full_name: user?.name ?? '', email: user?.email ?? '' },
  });

  const mutation = useMutation({
    mutationFn: (data) => bookingsApi.create(property.id, data),
    onSuccess:  () => { toast.success('Booking request sent!'); reset(); },
    onError:    (e) => toast.error(e.response?.data?.message ?? 'Failed to send request.'),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="detail-booking-form">
      <h3 className="detail-sidebar-title">Request a Viewing</h3>
      <div className="form-group">
        <label className="form-label">Full Name</label>
        <input className="form-control" {...register('full_name', { required: 'Required' })} placeholder="Your full name" />
        {errors.full_name && <span className="form-error">{errors.full_name.message}</span>}
      </div>
      <div className="form-group">
        <label className="form-label">Email</label>
        <input className="form-control" type="email" {...register('email', { required: 'Required' })} placeholder="you@email.com" />
        {errors.email && <span className="form-error">{errors.email.message}</span>}
      </div>
      <div className="form-group">
        <label className="form-label">Phone</label>
        <input className="form-control" {...register('phone')} placeholder="+63 9xx xxx xxxx" />
      </div>
      <div className="grid-2">
        <div className="form-group">
          <label className="form-label">Visit Date</label>
          <input className="form-control" type="date" {...register('check_in', { required: 'Required' })} />
          {errors.check_in && <span className="form-error">{errors.check_in.message}</span>}
        </div>
        {property.listing_type === 'rent' && (
          <div className="form-group">
            <label className="form-label">Check-out</label>
            <input className="form-control" type="date" {...register('check_out')} />
          </div>
        )}
      </div>
      <div className="form-group">
        <label className="form-label">Message</label>
        <textarea className="form-control" {...register('message')} placeholder="Any questions or requests?" rows={3} />
      </div>
      <button type="submit" className="btn btn-primary btn-full" disabled={mutation.isPending}>
        <Calendar size={15} />
        {mutation.isPending ? 'Sendingâ€¦' : 'Send Booking Request'}
      </button>
    </form>
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { user }  = useAuthStore();
  const navigate  = useNavigate();
  const qc        = useQueryClient();
  const [mainImg, setMainImg] = useState(0);
  const [favLoading, setFavLoading] = useState(false);
  const [favorited, setFavorited] = useState(null);

  const { data: property, isLoading, isError } = useQuery({
    queryKey: ['property', id],
    queryFn:  () => propertiesApi.get(id).then((r) => r.data),
    onSuccess:(d) => setFavorited(d.is_favorited ?? false),
  });

  const deleteMutation = useMutation({
    mutationFn: () => propertiesApi.delete(id),
    onSuccess:  () => { toast.success('Property deleted.'); navigate('/my-listings'); },
    onError:    () => toast.error('Failed to delete.'),
  });

  if (isLoading) return <div className="loading-center"><div className="spinner" /></div>;
  if (isError)   return <div className="container page"><p>Property not found.</p></div>;

  const images = [
    ...(property.cover_image ? [{ path: property.cover_image }] : []),
    ...(property.images ?? []),
  ];

  const handleFav = async () => {
    if (!user) { toast.error('Please log in.'); return; }
    setFavLoading(true);
    try {
      const { data } = await favoritesApi.toggle(id);
      setFavorited(data.favorited);
      toast.success(data.message);
    } finally { setFavLoading(false); }
  };

  const isOwner = user?.id === property.user_id;

  const formatPrice = (price) =>
    new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 0 }).format(price);

  const initials = property.user?.name?.[0]?.toUpperCase() ?? 'A';

  return (
    <div className="page">
      <div className="container">

        {/* Back */}
        <Link to="/properties" className="btn btn-ghost btn-sm detail-back">
          <ChevronLeft size={15} /> Back to Listings
        </Link>

        {/* ── Gallery ── */}
        <div className="detail-gallery">
          <div className="detail-gallery-main">
            <img src={images[mainImg] ? imgUrl(images[mainImg].path ?? images[mainImg]) : imgUrl(null)} alt={property.title} />
            {images.length > 1 && (
              <div className="detail-gallery-thumbs">
                {images.map((img, i) => (
                  <button
                    key={i}
                    className={`detail-thumb${i === mainImg ? ' active' : ''}`}
                    onClick={() => setMainImg(i)}
                  >
                    <img src={imgUrl(img.path ?? img)} alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className="detail-gallery-side">
              {images.slice(1, 3).map((img, i) => (
                <button key={i} className="detail-side-img" onClick={() => setMainImg(i + 1)}>
                  <img src={imgUrl(img.path ?? img)} alt="" />
                </button>
              ))}
            </div>
          )}
      </div>

      {/* â”€â”€ Body â”€â”€ */}
      <div className="detail-body">

          {/* â”€â”€ Left column â”€â”€ */}
          <div className="detail-main">

            {/* Title row */}
            <div className="detail-title-row">
              <div className="detail-badges">
                <span className={`badge ${property.listing_type === 'rent' ? 'badge-blue' : 'badge-green'}`}>
                  {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
                </span>
                <span className="badge badge-gray">{property.type}</span>
                {property.status !== 'available' && (
                  <span className={`badge status-${property.status}`}>{property.status}</span>
                )}
              </div>
              <div className="detail-actions">
                <button className={`btn btn-outline btn-sm${favorited ? ' detail-fav-active' : ''}`} onClick={handleFav} disabled={favLoading}>
                  <Heart size={14} fill={favorited ? 'currentColor' : 'none'} />
                  {favorited ? 'Saved' : 'Save'}
                </button>
                {isOwner && (
                  <>
                    <Link to={`/my-listings/${id}/edit`} className="btn btn-outline btn-sm">
                      <Pencil size={13} /> Edit
                    </Link>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => { if (window.confirm('Delete this property?')) deleteMutation.mutate(); }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>

            <h1 className="detail-title">{property.title}</h1>

            <div className="detail-price">
              {formatPrice(property.price)}
              {property.listing_type === 'rent' && <span className="detail-price-unit">/month</span>}
            </div>

            <div className="detail-address">
              <MapPin size={14} />
              {property.address}, {property.city}, {property.state}
            </div>

            {/* Specs strip */}
            <div className="detail-specs-strip">
              {property.bedrooms > 0     && <div className="detail-spec"><Bed size={17} /><span>{property.bedrooms}</span><small>Beds</small></div>}
              {property.bathrooms > 0    && <div className="detail-spec"><Bath size={17} /><span>{property.bathrooms}</span><small>Baths</small></div>}
              {property.area_sqft        && <div className="detail-spec"><Ruler size={17} /><span>{property.area_sqft.toLocaleString()}</span><small>sqft</small></div>}
              {property.parking_spots > 0 && <div className="detail-spec"><Car size={17} /><span>{property.parking_spots}</span><small>Parking</small></div>}
              {property.is_furnished     && <div className="detail-spec"><CheckCircle2 size={17} style={{ color: 'var(--success)' }} /><span>Furnished</span></div>}
            </div>

            {/* Description */}
            <div className="detail-section">
              <h2 className="detail-section-title">About this Property</h2>
              <p className="detail-description">{property.description}</p>
            </div>

            {/* Amenities */}
            {property.amenities?.length > 0 && (
              <div className="detail-section">
                <h2 className="detail-section-title">Amenities &amp; Features</h2>
                <div className="detail-amenities">
                  {property.amenities.map((a) => (
                    <span key={a} className="amenity-tag"><CheckCircle2 size={12} />{a}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Map */}
            {property.latitude && property.longitude && (
              <div className="detail-section">
                <h2 className="detail-section-title">Location</h2>
                <PropertyMap
                  properties={[property]}
                  center={[property.latitude, property.longitude]}
                  zoom={14}
                />
              </div>
            )}
          </div>

          {/* â”€â”€ Sidebar â”€â”€ */}
          <div className="detail-sidebar">

            {/* Price card */}
            <div className="detail-sidebar-price-card">
              <div className="detail-sidebar-price">{formatPrice(property.price)}{property.listing_type === 'rent' && <span>/mo</span>}</div>
              <span className={`badge ${property.listing_type === 'rent' ? 'badge-blue' : 'badge-green'}`}>
                {property.listing_type === 'rent' ? 'For Rent' : 'For Sale'}
              </span>
            </div>

            {/* Agent card */}
            <div className="card mb-4">
              <div className="card-body">
                <p className="detail-sidebar-label">Listed by</p>
                <div className="detail-agent">
                  <div className="detail-agent-avatar">{initials}</div>
                  <div>
                    <div className="detail-agent-name">{property.user?.name}</div>
                    <div className="detail-agent-email">{property.user?.email}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking form / login prompt */}
            <div className="card">
              <div className="card-body">
                {user ? (
                  <BookingForm property={property} />
                ) : (
                  <div className="detail-login-prompt">
                    <Calendar size={32} style={{ color: 'var(--primary)', opacity: .5 }} />
                    <p>Sign in to request a viewing or book this property.</p>
                    <Link to="/login" className="btn btn-primary btn-full">Sign In to Book</Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

