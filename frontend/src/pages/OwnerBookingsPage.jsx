import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bookingsApi } from '../api/index.js';
import toast from 'react-hot-toast';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { imgUrl } from '../utils/imgUrl.js';

const PLACEHOLDER = imgUrl(null);

export default function OwnerBookingsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['owner-bookings'],
    queryFn:  () => bookingsApi.ownerBookings().then((r) => r.data),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => bookingsApi.updateStatus(id, status),
    onSuccess:  () => { toast.success('Status updated.'); qc.invalidateQueries(['owner-bookings']); },
    onError:    () => toast.error('Failed to update.'),
  });

  const bookings = data?.data ?? [];

  return (
    <div className="page">
      <div className="container">
        <div className="section-header">
          <h2>Incoming Booking Requests</h2>
          <p>Manage booking requests for your properties</p>
        </div>

        {isLoading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : bookings.length === 0 ? (
          <div className="empty-state">
            <Clock size={48} />
            <h3>No booking requests yet</h3>
            <p>Requests will appear here when buyers contact you.</p>
          </div>
        ) : (
          <div className="card">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--bg)' }}>
                  {['Property', 'Requester', 'Dates', 'Message', 'Status', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '.75rem 1rem', textAlign: 'left', fontSize: '.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{b.property?.title}</div>
                      <div className="text-muted text-xs">{b.property?.address}</div>
                    </td>
                    <td style={{ padding: '.75rem 1rem' }}>
                      <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{b.full_name}</div>
                      <div className="text-muted text-xs">{b.email}</div>
                      {b.phone && <div className="text-muted text-xs">{b.phone}</div>}
                    </td>
                    <td style={{ padding: '.75rem 1rem', fontSize: '.85rem' }}>
                      <div>In: <strong>{b.check_in}</strong></div>
                      {b.check_out && <div>Out: <strong>{b.check_out}</strong></div>}
                    </td>
                    <td style={{ padding: '.75rem 1rem', maxWidth: 200 }}>
                      <p style={{ fontSize: '.8rem', color: 'var(--text-muted)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                        {b.message ?? '—'}
                      </p>
                    </td>
                    <td style={{ padding: '.75rem 1rem' }}>
                      <span className={`badge status-${b.status}`}>{b.status}</span>
                    </td>
                    <td style={{ padding: '.75rem 1rem' }}>
                      {b.status === 'pending' && (
                        <div className="flex gap-1">
                          <button
                            className="btn btn-sm"
                            style={{ background: 'var(--success)', color: '#fff' }}
                            onClick={() => statusMutation.mutate({ id: b.id, status: 'accepted' })}
                          >
                            <CheckCircle size={13} /> Accept
                          </button>
                          <button
                            className="btn btn-danger btn-sm"
                            onClick={() => statusMutation.mutate({ id: b.id, status: 'rejected' })}
                          >
                            <XCircle size={13} /> Reject
                          </button>
                        </div>
                      )}
                      {b.status !== 'pending' && (
                        <span className="text-muted text-xs">No action needed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
