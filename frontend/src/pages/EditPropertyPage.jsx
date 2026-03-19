import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { propertiesApi } from '../api/index.js';
import PropertyForm from '../components/Properties/PropertyForm.jsx';
import toast from 'react-hot-toast';
import { ChevronLeft } from 'lucide-react';

export default function EditPropertyPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn:  () => propertiesApi.get(id).then((r) => r.data),
  });

  const mutation = useMutation({
    mutationFn: (fd) => propertiesApi.update(id, fd),
    onSuccess: () => {
      toast.success('Listing updated!');
      qc.invalidateQueries(['my-listings']);
      qc.invalidateQueries(['property', id]);
      navigate(`/properties/${id}`);
    },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Failed to update.'),
  });

  if (isLoading) return <div className="loading-center"><div className="spinner" /></div>;

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-4">
          <ChevronLeft size={15} /> Back
        </button>
        <div className="section-header">
          <h2>Edit Listing</h2>
          <p>Update your property details</p>
        </div>
        <PropertyForm
          defaultValues={property}
          onSubmit={mutation.mutate}
          isLoading={mutation.isPending}
        />
      </div>
    </div>
  );
}
