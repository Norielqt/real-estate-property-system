import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import useAuthStore from './store/authStore.js';
import Navbar from './components/Layout/Navbar.jsx';
import Footer from './components/Layout/Footer.jsx';
import ProtectedRoute from './components/Layout/ProtectedRoute.jsx';

const AUTH_ROUTES = ['/login', '/register'];

// Pages
import HomePage from './pages/HomePage.jsx';
import PropertiesPage from './pages/PropertiesPage.jsx';
import PropertyDetailPage from './pages/PropertyDetailPage.jsx';
import MapPage from './pages/MapPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import FavoritesPage from './pages/FavoritesPage.jsx';
import MyListingsPage from './pages/MyListingsPage.jsx';
import CreatePropertyPage from './pages/CreatePropertyPage.jsx';
import EditPropertyPage from './pages/EditPropertyPage.jsx';
import BookingsPage from './pages/BookingsPage.jsx';
import OwnerBookingsPage from './pages/OwnerBookingsPage.jsx';
import ChatbotWidget from './components/Chatbot/ChatbotWidget.jsx';

export default function App() {
  const fetchMe = useAuthStore((s) => s.fetchMe);
  const { pathname } = useLocation();
  const isAuth = AUTH_ROUTES.includes(pathname);

  useEffect(() => { fetchMe(); }, []);

  return (
    <>
      {!isAuth && <Navbar />}
      <Routes>
        <Route path="/"                  element={<HomePage />} />
        <Route path="/properties"        element={<PropertiesPage />} />
        <Route path="/properties/:id"    element={<PropertyDetailPage />} />
        <Route path="/map"               element={<MapPage />} />
        <Route path="/login"             element={<LoginPage />} />
        <Route path="/register"          element={<RegisterPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/favorites"         element={<FavoritesPage />} />
          <Route path="/my-listings"       element={<MyListingsPage />} />
          <Route path="/my-listings/new"   element={<CreatePropertyPage />} />
          <Route path="/my-listings/:id/edit" element={<EditPropertyPage />} />
          <Route path="/my-bookings"       element={<BookingsPage />} />
          <Route path="/owner-bookings"    element={<OwnerBookingsPage />} />
        </Route>
      </Routes>
      {!isAuth && <Footer />}
      {!isAuth && <ChatbotWidget />}
    </>
  );
}
