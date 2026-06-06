import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { propertiesApi } from '../api/index.js';
import PropertyCard from '../components/Properties/PropertyCard.jsx';
import {
  Building2, MapPin, TrendingUp, Shield,
  Search, CheckCircle2, Star, ArrowRight, Home, Key,
} from 'lucide-react';

const STATS = [
  { value: '6,000+', label: 'Active Listings' },
  { value: '80+',    label: 'Cities Covered' },
  { value: '₱2.4B',  label: 'Properties Sold' },
  { value: '10K+',   label: 'Happy Clients' },
];

const FEATURES = [
  {
    icon: Search,
    title: 'Smart Property Search',
    desc: 'Filter by location, price, type, and amenities. Find exactly what you need in seconds.',
  },
  {
    icon: CheckCircle2,
    title: 'Verified Listings',
    desc: 'Every listing is reviewed for accuracy. Browse with confidence knowing details are up to date.',
  },
  {
    icon: Star,
    title: 'Top Agents & Owners',
    desc: 'Connect directly with trusted property owners and licensed agents across the Philippines.',
  },
];

const FLOAT_CARDS = [
  { icon: Building2, num: '6,000+', label: 'Active Listings' },
  { icon: Shield,    num: '100%',   label: 'Verified Properties' },
  { icon: MapPin,    num: '80+',    label: 'Cities Covered' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('sale');
  const [search, setSearch] = useState('');

  const { data } = useQuery({
    queryKey: ['featured-properties'],
    queryFn: () => propertiesApi.publicList({ featured: true, per_page: 6 }).then((r) => r.data),
  });

  const properties = data?.data ?? [];

  function handleSearch(e) {
    e.preventDefault();
    const params = new URLSearchParams({ listing_type: tab });
    if (search.trim()) params.set('search', search.trim());
    navigate(`/properties?${params}`);
  }

  return (
    <div>
      {/* ── Hero ── */}
      <section className="hp-hero">
        <div className="hp-hero-layout">

          {/* Left: content */}
          <div className="hp-hero-left">
            <div className="hp-hero-eyebrow">
              <span className="hp-hero-eyebrow-dot" />
              Philippines&rsquo; #1 Property Platform
            </div>

            <h1 className="hp-hero-title">
              Find Your<br />
              Perfect{' '}
              <span className="hp-hero-accent">Home</span>
            </h1>

            <p className="hp-hero-sub">
              Thousands of houses, condos, apartments &amp; commercial spaces for sale and rent across the Philippines.
            </p>

            {/* Search card */}
            <div className="hp-search-card">
              <div className="hp-search-tabs">
                <button
                  className={`hp-search-tab${tab === 'sale' ? ' active' : ''}`}
                  onClick={() => setTab('sale')}
                >
                  <Key size={13} /> For Sale
                </button>
                <button
                  className={`hp-search-tab${tab === 'rent' ? ' active' : ''}`}
                  onClick={() => setTab('rent')}
                >
                  <Home size={13} /> For Rent
                </button>
              </div>

              <form className="hp-search-bar" onSubmit={handleSearch}>
                <MapPin size={17} className="hp-search-icon" />
                <input
                  type="text"
                  placeholder="Search city, area, or keyword…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button type="submit" className="hp-search-btn">
                  <Search size={15} /> Search
                </button>
              </form>

              <div className="hp-search-quick">
                <span>Popular:</span>
                {['Metro Manila', 'Cebu', 'BGC', 'Makati', 'Boracay'].map((c) => (
                  <Link key={c} to={`/properties?search=${c}&listing_type=${tab}`} className="hp-quick-tag">
                    {c}
                  </Link>
                ))}
              </div>
            </div>

            <div className="hp-hero-cta">
              <Link to="/map" className="hp-ghost-btn">
                <MapPin size={14} /> Explore on Map <ArrowRight size={13} />
              </Link>
            </div>
          </div>

          {/* Right: floating stat cards */}
          <div className="hp-hero-right">
            {FLOAT_CARDS.map(({ icon: Icon, num, label }) => (
              <div key={label} className="hp-float-card">
                <div className="hp-float-icon">
                  <Icon size={18} />
                </div>
                <div>
                  <div className="hp-float-num">{num}</div>
                  <div className="hp-float-label">{label}</div>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="hp-stats-bar">
        <div className="hp-stats-grid">
          {STATS.map(({ value, label }) => (
            <div key={label} className="hp-stat">
              <div className="hp-stat-value">{value}</div>
              <div className="hp-stat-label">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Featured Properties ── */}
      {properties.length > 0 && (
        <section className="hp-section">
          <div className="container">
            <div className="hp-section-header">
              <div>
                <p className="hp-section-eyebrow">Curated picks</p>
                <h2 className="hp-section-title">Featured Properties</h2>
              </div>
              <Link to="/properties" className="hp-view-all">
                View All <ArrowRight size={14} />
              </Link>
            </div>
            <div className="grid-3">
              {properties.map((p) => <PropertyCard key={p.id} property={p} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── Why Us ── */}
      <section className="hp-features-section">
        <div className="container">
          <div className="hp-section-header centered">
            <p className="hp-section-eyebrow">Why RealtorHQ?</p>
            <h2 className="hp-section-title">Everything you need to find home</h2>
          </div>
          <div className="hp-features-grid">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="hp-feature-card">
                <div className="hp-feature-icon"><Icon size={20} /></div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="hp-cta">
        <div className="hp-cta-overlay" />
        <div className="hp-cta-inner">
          <div className="hp-cta-text">
            <h2>List Your Property Today</h2>
            <p>Reach thousands of buyers and renters across the Philippines. Free to get started.</p>
          </div>
          <div className="hp-cta-actions">
            <Link to="/register" className="hp-cta-primary">
              Get Started Free <ArrowRight size={16} />
            </Link>
            <Link to="/my-listings/new" className="hp-cta-ghost">
              Post a Listing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
