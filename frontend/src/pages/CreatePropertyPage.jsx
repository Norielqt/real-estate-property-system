import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { propertiesApi } from '../api/index.js';
import PropertyForm from '../components/Properties/PropertyForm.jsx';
import toast from 'react-hot-toast';
import { ChevronLeft } from 'lucide-react';

export default function CreatePropertyPage() {
  const navigate = useNavigate();
  const qc = useQueryClient();

  const mutation = useMutation({
    mutationFn: (fd) => propertiesApi.create(fd),
    onSuccess: (res) => {
      toast.success('Listing created!');
      qc.invalidateQueries(['my-listings']);
      navigate(`/properties/${res.data.id}`);
    },
    onError: (e) => toast.error(e.response?.data?.message ?? 'Failed to create listing.'),
  });

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 800 }}>
        <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm mb-4">
          <ChevronLeft size={15} /> Back
        </button>
        <div className="section-header">
          <h2>Create New Listing</h2>
          <p>Fill in the details to list your property</p>
        </div>
        <PropertyForm onSubmit={mutation.mutate} isLoading={mutation.isPending} />
      </div>
    </div>
  );
}
