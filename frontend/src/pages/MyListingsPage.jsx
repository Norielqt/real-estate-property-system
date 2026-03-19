import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { propertiesApi } from '../api/index.js';
import { Pencil, Trash2, PlusCircle, Eye, Heart } from 'lucide-react';
import toast from 'react-hot-toast';
import { imgUrl } from '../utils/imgUrl.js';

const PLACEHOLDER = imgUrl(null);

export default function MyListingsPage() {
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['my-listings'],
    queryFn:  () => propertiesApi.myListings().then((r) => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => propertiesApi.delete(id),
    onSuccess:  () => { toast.success('Deleted.'); qc.invalidateQueries(['my-listings']); },
    onError:    () => toast.error('Failed to delete.'),
  });

  const properties = data?.data ?? [];

  return (
    <div className="page">
      <div className="container">
        <div className="section-header flex justify-between items-center">
          <div>
            <h2>My Listings</h2>
            <p>Manage your property listings</p>
          </div>
          <Link to="/my-listings/new" className="btn btn-primary">
            <PlusCircle size={15} /> Add Listing
          </Link>
        </div>

        {isLoading ? (
          <div className="loading-center"><div className="spinner" /></div>
        ) : properties.length === 0 ? (
          <div className="empty-state">
            <h3>No listings yet</h3>
            <p>Create your first property listing to get started.</p>
            <Link to="/my-listings/new" className="btn btn-primary mt-4">
              <PlusCircle size={15} /> Create Listing
            </Link>
          </div>
        ) : (
          <div className="card">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border)', background: 'var(--bg)' }}>
                  {['Property', 'Type', 'Price', 'Status', 'Saves', 'Actions'].map((h) => (
                    <th key={h} style={{ padding: '.75rem 1rem', textAlign: 'left', fontSize: '.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {properties.map((p) => {
                  const imgSrc = imgUrl(p.cover_image ?? p.images?.[0]?.path ?? null);
                  return (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '.75rem 1rem' }}>
                        <div className="flex items-center gap-3">
                          <img src={imgSrc} alt={p.title} style={{ width: 72, height: 52, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} />
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '.875rem' }}>{p.title}</div>
                            <div className="text-muted text-xs">{p.city}, {p.state}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '.75rem 1rem' }}>
                        <span className="badge badge-gray">{p.type}</span>
                        <br />
                        <span className={`badge ${p.listing_type === 'rent' ? 'badge-blue' : 'badge-green'}`} style={{ marginTop: '.25rem' }}>
                          {p.listing_type === 'rent' ? 'Rent' : 'Sale'}
                        </span>
                      </td>
                      <td style={{ padding: '.75rem 1rem', fontWeight: 700, color: 'var(--primary)', fontSize: '.9rem' }}>
                        ₱{Number(p.price).toLocaleString()}
                        {p.listing_type === 'rent' && <span style={{ fontSize: '.75rem', fontWeight: 400, color: 'var(--text-muted)' }}>/mo</span>}
                      </td>
                      <td style={{ padding: '.75rem 1rem' }}>
                        <span className={`badge status-${p.status}`}>{p.status}</span>
                      </td>
                      <td style={{ padding: '.75rem 1rem' }}>
                        <span className="flex items-center gap-1 text-muted text-sm">
                          <Heart size={13} /> {p.favorites_count ?? 0}
                        </span>
                      </td>
                      <td style={{ padding: '.75rem 1rem' }}>
                        <div className="flex gap-1">
                          <Link to={`/properties/${p.id}`} className="btn btn-ghost btn-sm" title="View">
                            <Eye size={14} />
                          </Link>
                          <Link to={`/my-listings/${p.id}/edit`} className="btn btn-outline btn-sm" title="Edit">
                            <Pencil size={14} />
                          </Link>
                          <button
                            className="btn btn-danger btn-sm"
                            title="Delete"
                            onClick={() => { if (window.confirm('Delete this listing?')) deleteMutation.mutate(p.id); }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
