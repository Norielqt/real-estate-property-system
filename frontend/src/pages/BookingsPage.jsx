import { useQuery } from '@tanstack/react-query';
import { bookingsApi } from '../api/index.js';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { imgUrl } from '../utils/imgUrl.js';

const PLACEHOLDER = imgUrl(null);

function statusBadge(status) {
  return <span className={`badge status-${status}`}>{status}</span>;
}

export default function BookingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['my-bookings'],
    queryFn:  () => bookingsApi.myBookings().then((r) => r.data),
  });

  const bookings = data?.data ?? [];

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <h2>My Booking Requests</h2>
          <p>Track your property viewing and booking requests</p>
        </div>

        {isLoading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} />
            <h3>No bookings yet</h3>
            <p>Request a viewing on any property listing.</p>
            <Link to="/properties" className="btn btn-primary mt-4">Browse Properties</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {bookings.map((b) => {
              const imgSrc = imgUrl(b.property?.cover_image ?? null);
              return (
                <div key={b.id} className="card">
                  <div className="card-body flex items-center gap-4">
                    <img src={imgSrc} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>{b.property?.title}</div>
                      <div className="text-muted text-xs">{b.property?.address}</div>
                      <div className="flex gap-3 mt-1 text-sm">
                        <span>Check-in: <strong>{b.check_in}</strong></span>
                        {b.check_out && <span>Check-out: <strong>{b.check_out}</strong></span>}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      {statusBadge(b.status)}
                      <div className="text-xs text-muted mt-1">{new Date(b.created_at).toLocaleDateString()}</div>
                      <Link to={`/properties/${b.property_id}`} className="btn btn-outline btn-sm mt-2">View Property</Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
