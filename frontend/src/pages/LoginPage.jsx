import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore.js';
import toast from 'react-hot-toast';
import { Building2, MapPin, ShieldCheck, Star, Users } from 'lucide-react';

export default function LoginPage() {
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await login(data);
      toast.success('Welcome back!');
      navigate('/');
    } catch (e) {
      toast.error(e.response?.data?.message ?? 'Login failed.');
    }
  };

  return (
    <div className="auth-split">
      {/* Left image panel — 70% */}
      <div className="auth-image">
        <img
          src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=80"
          alt="Beautiful property"
        />
        <div className="auth-image-overlay" />
        <div className="auth-image-content">
          <div className="auth-image-tagline">
            <h2>Find Your Perfect Home<br />in the Philippines</h2>
            <p><MapPin size={14} /> Thousands of verified listings nationwide</p>
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
            <h2>Welcome back</h2>
            <p>Sign in to continue to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
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
                {...register('password', { required: 'Password is required' })}
                placeholder="••••••••"
              />
              {errors.password && <span className="form-error">{errors.password.message}</span>}
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p className="auth-switch">
            Don&rsquo;t have an account? <Link to="/register">Create one free</Link>
          </p>

          <div className="auth-demo-hint">
            <strong>Demo credentials</strong><br />
            owner@realestate.com / password
          </div>

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
