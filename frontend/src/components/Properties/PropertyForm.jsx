import { useForm } from 'react-hook-form';
import { useState } from 'react';
import { Upload, MapPin, Images } from 'lucide-react';
import LocationPicker from '../Map/LocationPicker.jsx';
import { imgUrl } from '../../utils/imgUrl.js';
import { LOCAL_IMAGES } from '../../data/localImages.js';

const TYPES         = ['house', 'apartment', 'condo', 'villa', 'studio', 'land'];
const LISTING_TYPES = ['sale', 'rent'];
const STATUSES      = ['available', 'pending', 'sold', 'rented'];
const AMENITY_OPTIONS = ['Swimming Pool', 'Garden', 'Gym', 'Parking', 'Security System', 'Solar Panels', 'Elevator', 'CCTV', 'Furnished', 'Pet Friendly', 'Beach Access', 'Smart Home', 'Rooftop Deck', 'Co-working Space', 'Laundry'];

export default function PropertyForm({ defaultValues = {}, onSubmit, isLoading }) {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({ defaultValues });

  const [coverPreview, setCoverPreview] = useState(
    defaultValues.cover_image ? imgUrl(defaultValues.cover_image) : null
  );
  const [localImagePath, setLocalImagePath] = useState(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [imagesPreviews, setImagesPreviews] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState(defaultValues.amenities ?? []);
  const [lat, setLat] = useState(defaultValues.latitude ?? null);
  const [lng, setLng] = useState(defaultValues.longitude ?? null);

  const handleCoverChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverPreview(URL.createObjectURL(file));
      setLocalImagePath(null);
    }
  };

  const pickLocalImage = (path) => {
    setLocalImagePath(path);
    setCoverPreview(path);
    setShowLibrary(false);
    setValue('cover_image', undefined);
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files);
    setImagesPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const toggleAmenity = (a) => {
    const next = selectedAmenities.includes(a)
      ? selectedAmenities.filter((x) => x !== a)
      : [...selectedAmenities, a];
    setSelectedAmenities(next);
    setValue('amenities', next);
  };

  const handleLocationSelect = (newLat, newLng) => {
    setLat(newLat);
    setLng(newLng);
    setValue('latitude', newLat);
    setValue('longitude', newLng);
  };

  const submit = (data) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => {
      if (k === 'amenities') {
        if (Array.isArray(v)) v.forEach((a) => fd.append('amenities[]', a));
      } else if (k === 'cover_image') {
        if (!localImagePath && v instanceof FileList && v.length > 0) {
          fd.append('cover_image', v[0]);
        }
      } else if (k === 'images' && v instanceof FileList) {
        Array.from(v).forEach((f) => fd.append('images[]', f));
      } else if (v !== undefined && v !== null && v !== '') {
        fd.append(k, v);
      }
    });
    if (localImagePath) {
      fd.append('cover_image_url', localImagePath);
    }
    onSubmit(fd);
  };

  return (
    <form onSubmit={handleSubmit(submit)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Basic Info */}
      <div className="card">
        <div className="card-body">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Basic Information</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input className="form-control" {...register('title', { required: 'Required' })} placeholder="e.g. Modern 3BR House in Quezon City" />
              {errors.title && <span className="form-error">{errors.title.message}</span>}
            </div>
            <div className="form-group">
              <label className="form-label">Description *</label>
              <textarea className="form-control" rows={4} {...register('description', { required: 'Required' })} placeholder="Describe the property…" />
              {errors.description && <span className="form-error">{errors.description.message}</span>}
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Property Type *</label>
                <select className="form-control" {...register('type', { required: 'Required' })}>
                  <option value="">Select type</option>
                  {TYPES.map((t) => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
                {errors.type && <span className="form-error">{errors.type.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Listing Type *</label>
                <select className="form-control" {...register('listing_type', { required: 'Required' })}>
                  <option value="">Select</option>
                  {LISTING_TYPES.map((t) => <option key={t} value={t}>{t === 'sale' ? 'For Sale' : 'For Rent'}</option>)}
                </select>
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Price (₱) *</label>
                <input className="form-control" type="number" {...register('price', { required: 'Required', min: 0 })} placeholder="0" />
                {errors.price && <span className="form-error">{errors.price.message}</span>}
              </div>
              <div className="form-group">
                <label className="form-label">Status</label>
                <select className="form-control" {...register('status')}>
                  {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location */}
      <div className="card">
        <div className="card-body">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}><MapPin size={16} style={{ display: 'inline', marginRight: 4 }} />Location</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Address *</label>
              <input className="form-control" {...register('address', { required: 'Required' })} placeholder="Street address" />
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">City *</label>
                <input className="form-control" {...register('city', { required: 'Required' })} placeholder="e.g. Makati" />
              </div>
              <div className="form-group">
                <label className="form-label">State/Province *</label>
                <input className="form-control" {...register('state', { required: 'Required' })} placeholder="e.g. Metro Manila" />
              </div>
            </div>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Country</label>
                <input className="form-control" {...register('country')} defaultValue="Philippines" />
              </div>
              <div className="form-group">
                <label className="form-label">ZIP Code</label>
                <input className="form-control" {...register('zip_code')} placeholder="e.g. 1226" />
              </div>
            </div>
            <input type="hidden" {...register('latitude')} />
            <input type="hidden" {...register('longitude')} />
            <LocationPicker lat={lat} lng={lng} onChange={handleLocationSelect} />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="card">
        <div className="card-body">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Property Details</h3>
          <div className="grid-3" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Bedrooms</label>
              <input className="form-control" type="number" min="0" {...register('bedrooms')} defaultValue={0} />
            </div>
            <div className="form-group">
              <label className="form-label">Bathrooms</label>
              <input className="form-control" type="number" min="0" {...register('bathrooms')} defaultValue={0} />
            </div>
            <div className="form-group">
              <label className="form-label">Area (sqft)</label>
              <input className="form-control" type="number" min="0" {...register('area_sqft')} placeholder="0" />
            </div>
            <div className="form-group">
              <label className="form-label">Parking Spots</label>
              <input className="form-control" type="number" min="0" {...register('parking_spots')} defaultValue={0} />
            </div>
            <div className="form-group" style={{ justifyContent: 'flex-end' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer' }}>
                <input type="checkbox" {...register('is_furnished')} style={{ width: 16, height: 16 }} />
                Furnished
              </label>
            </div>
            <div className="form-group" style={{ justifyContent: 'flex-end' }}>
              <label className="form-label" style={{ display: 'flex', alignItems: 'center', gap: '.5rem', cursor: 'pointer' }}>
                <input type="checkbox" {...register('is_featured')} style={{ width: 16, height: 16 }} />
                Featured Listing
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="card">
        <div className="card-body">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Amenities</h3>
          <div className="flex flex-wrap gap-2">
            {AMENITY_OPTIONS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => toggleAmenity(a)}
                className={`btn btn-sm ${selectedAmenities.includes(a) ? 'btn-primary' : 'btn-outline'}`}
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Photos */}
      <div className="card">
        <div className="card-body">
          <h3 style={{ fontWeight: 700, marginBottom: '1rem' }}>Photos</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Cover Image</label>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '.5rem',
                border: '2px dashed var(--border)', borderRadius: 'var(--radius)',
                padding: '1.25rem', cursor: 'pointer', background: 'var(--bg)',
              }}>
                <input type="file" accept="image/*" {...register('cover_image')} onChange={handleCoverChange} style={{ display: 'none' }} />
                <Upload size={20} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>Click to upload cover image (max 5MB)</span>
              </label>

              <button
                type="button"
                onClick={() => setShowLibrary((v) => !v)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '.35rem',
                  marginTop: '.5rem', fontSize: '.8rem', fontWeight: 600,
                  color: showLibrary ? 'var(--text-muted)' : 'var(--primary)',
                  background: 'none', border: 'none', cursor: 'pointer', padding: 0,
                  transition: 'color 150ms var(--ease-out)',
                }}
              >
                <Images size={14} />
                {showLibrary ? 'Close Library' : 'Or choose from Property Library'}
              </button>

              {showLibrary && (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '.4rem',
                  marginTop: '.5rem', padding: '.75rem',
                  background: 'var(--bg-subtle)', borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                }}>
                  {LOCAL_IMAGES.map(({ path, label }) => (
                    <button
                      key={path}
                      type="button"
                      onClick={() => pickLocalImage(path)}
                      title={label}
                      style={{
                        padding: 0,
                        border: localImagePath === path
                          ? '2.5px solid var(--primary)'
                          : '2px solid transparent',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        background: 'none',
                        transition: 'border-color 150ms var(--ease-out), transform 120ms var(--ease-out)',
                      }}
                      onMouseEnter={(e) => { if (localImagePath !== path) e.currentTarget.style.borderColor = 'var(--border)'; }}
                      onMouseLeave={(e) => { if (localImagePath !== path) e.currentTarget.style.borderColor = 'transparent'; }}
                    >
                      <img
                        src={path}
                        alt={label}
                        style={{ width: '100%', height: 64, objectFit: 'cover', display: 'block' }}
                      />
                    </button>
                  ))}
                </div>
              )}

              {coverPreview && (
                <div style={{ position: 'relative', marginTop: '.5rem' }}>
                  <img
                    src={coverPreview}
                    alt="Cover preview"
                    style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 'var(--radius)' }}
                  />
                  {localImagePath && (
                    <span style={{
                      position: 'absolute', bottom: 8, left: 8,
                      background: 'var(--primary)', color: '#fff',
                      fontSize: '.7rem', fontWeight: 700, padding: '.2rem .55rem',
                      borderRadius: 99,
                    }}>
                      From Library
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Additional Photos</label>
              <label style={{
                display: 'flex', alignItems: 'center', gap: '.5rem',
                border: '2px dashed var(--border)', borderRadius: 'var(--radius)',
                padding: '1.25rem', cursor: 'pointer', background: 'var(--bg)',
              }}>
                <input type="file" accept="image/*" multiple {...register('images')} onChange={handleImagesChange} style={{ display: 'none' }} />
                <Upload size={20} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '.85rem', color: 'var(--text-muted)' }}>Click to upload additional images (multiple allowed)</span>
              </label>
              {imagesPreviews.length > 0 && (
                <div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap', marginTop: '.4rem' }}>
                  {imagesPreviews.map((src, i) => (
                    <img key={i} src={src} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-lg" disabled={isLoading}>
        {isLoading ? 'Saving…' : 'Save Listing'}
      </button>
    </form>
  );
}
