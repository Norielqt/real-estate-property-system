import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Home, Map, Heart, List, LogIn, LogOut, PlusCircle, Calendar, Building2, Menu, X, ChevronDown } from 'lucide-react';
import useAuthStore from '../../store/authStore.js';
import toast from 'react-hot-toast';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);

  const handleLogout = async () => {
    setDropOpen(false);
    setMenuOpen(false);
    await logout();
    toast.success('Logged out!');
    navigate('/');
  };

  const closeAll = () => { setMenuOpen(false); setDropOpen(false); };

  const initials = user ? user.name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2) : '';

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="nav-logo" onClick={closeAll}>
          <div className="nav-logo-icon"><Building2 size={18} /></div>
          <span>RealtorHQ</span>
        </Link>

        {/* Desktop center links */}
        <div className="nav-center">
          <NavLink to="/properties" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <Home size={15} /><span>Listings</span>
          </NavLink>
          <NavLink to="/map" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <Map size={15} /><span>Map</span>
          </NavLink>
          {user && (
            <>
              <NavLink to="/favorites" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                <Heart size={15} /><span>Saved</span>
              </NavLink>
              <NavLink to="/my-bookings" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
                <Calendar size={15} /><span>Bookings</span>
              </NavLink>
            </>
          )}
        </div>

        {/* Desktop right actions */}
        <div className="nav-actions">
          {user ? (
            <>
              <NavLink to="/my-listings/new" className="btn btn-primary btn-sm">
                <PlusCircle size={15} /> List Property
              </NavLink>
              <div className="nav-avatar-wrap">
                <button className="nav-avatar" onClick={() => setDropOpen(o => !o)}>
                  <span className="avatar-initials">{initials}</span>
                  <ChevronDown size={14} className={`avatar-chevron${dropOpen ? ' open' : ''}`} />
                </button>
                {dropOpen && (
                  <div className="nav-dropdown">
                    <div className="nav-dropdown-header">
                      <p className="nav-dropdown-name">{user.name}</p>
                      <p className="nav-dropdown-email">{user.email}</p>
                    </div>
                    <div className="nav-dropdown-divider" />
                    <Link to="/my-listings" className="nav-dropdown-item" onClick={closeAll}>
                      <List size={14} /> My Listings
                    </Link>
                    <Link to="/my-bookings" className="nav-dropdown-item" onClick={closeAll}>
                      <Calendar size={14} /> My Bookings
                    </Link>
                    <div className="nav-dropdown-divider" />
                    <button className="nav-dropdown-item danger" onClick={handleLogout}>
                      <LogOut size={14} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <NavLink to="/login" className="btn btn-ghost-dark btn-sm">
                <LogIn size={14} /> Sign In
              </NavLink>
              <NavLink to="/register" className="btn btn-primary btn-sm">
                Get Started
              </NavLink>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button className="nav-hamburger" onClick={() => setMenuOpen(o => !o)} aria-label="Toggle menu">
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile drawer */}
      {menuOpen && (
        <div className="nav-mobile-drawer">
          <NavLink to="/properties" className="nav-mobile-link" onClick={closeAll}><Home size={16}/>Listings</NavLink>
          <NavLink to="/map" className="nav-mobile-link" onClick={closeAll}><Map size={16}/>Map</NavLink>
          {user ? (
            <>
              <NavLink to="/favorites" className="nav-mobile-link" onClick={closeAll}><Heart size={16}/>Saved</NavLink>
              <NavLink to="/my-listings" className="nav-mobile-link" onClick={closeAll}><List size={16}/>My Listings</NavLink>
              <NavLink to="/my-listings/new" className="nav-mobile-link" onClick={closeAll}><PlusCircle size={16}/>List a Property</NavLink>
              <NavLink to="/my-bookings" className="nav-mobile-link" onClick={closeAll}><Calendar size={16}/>Bookings</NavLink>
              <div className="nav-mobile-divider" />
              <button className="nav-mobile-link danger" onClick={handleLogout}><LogOut size={16}/>Sign Out</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-mobile-link" onClick={closeAll}><LogIn size={16}/>Sign In</NavLink>
              <NavLink to="/register" className="nav-mobile-link accent" onClick={closeAll}>Get Started</NavLink>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
