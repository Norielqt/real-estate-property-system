import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import toast from 'react-hot-toast';
import { Building2, MapPin, ShieldCheck, Star, Users } from 'lucide-react';

export default function RegisterPage() {
  const { register: registerUser, loading } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    try {
      await registerUser(data);
      toast.success('Account created! Welcome to RealtorHQ.');
      navigate('/');
    } catch (e) {
      const msg = e.response?.data?.message ?? 'Registration failed.';
      toast.error(msg);
    }
  };

  return (
    <div className="auth-split">
      {/* Left image panel — 70% */}
      <div className="auth-image">
        <img
          src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=80"
          alt="Modern home"
        />
        <div className="auth-image-overlay" />
        <div className="auth-image-content">
          <div className="auth-image-tagline">
            <h2>List, Discover &amp;<br />Connect Nationwide</h2>
            <p><MapPin size={14} /> Join 10,000+ happy property owners &amp; buyers</p>
          </div>
        </div>
      </div>

      {/* Right form panel — 30% */}
      <div className="auth-form-panel">
        <div className="auth-form-inner">

          <Link to="/" className="auth-form-logo">
            <div className="auth-form-logo-icon"><Building2 size={14} /></div>
            RealtorHQ
          </Link>

          <div className="auth-form-header">
            <h2>Create an Account</h2>
            <p>Free forever. No credit card needed.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                className="form-control"
                {...register('name', { required: 'Name is required' })}
                placeholder="Juan dela Cruz"
              />
              {errors.name && <span className="form-error">{errors.name.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email address</label>
              <input
                className="form-control"
                type="email"
                {...register('email', { required: 'Email is required' })}
                placeholder="you@email.com"
              />
              {errors.email && <span className="form-error">{errors.email.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                className="form-control"
                type="password"
                {...register('password', { required: 'Required', minLength: { value: 8, message: 'Minimum 8 characters' } })}
                placeholder="Min. 8 characters"
              />
              {errors.password && <span className="form-error">{errors.password.message}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                className="form-control"
                type="password"
                {...register('password_confirmation', {
                  required: 'Required',
                  validate: (v) => v === password || 'Passwords do not match',
                })}
                placeholder="••••••••"
              />
              {errors.password_confirmation && <span className="form-error">{errors.password_confirmation.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Get Started Free →'}
            </button>
          </form>

          <p className="auth-switch">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>

          <div className="auth-trust">
            <div className="auth-trust-item"><ShieldCheck size={18} />Secure</div>
            <div className="auth-trust-item"><Star size={18} />Verified</div>
            <div className="auth-trust-item"><Users size={18} />10K+ Users</div>
          </div>
        </div>
      </div>
    </div>
  );
}
