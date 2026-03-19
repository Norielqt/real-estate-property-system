# RealtorHQ — Real Estate Property System

> A full-stack real estate listing platform inspired by Zillow & Airbnb, built with **Laravel API + React + Leaflet + MySQL**.

---

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Backend   | Laravel 10, Sanctum (JWT-less auth) |
| Frontend  | React 18, Vite, React Router v6     |
| Map       | Leaflet + React-Leaflet             |
| State     | Zustand, TanStack Query             |
| Forms     | React Hook Form                     |
| Database  | MySQL                               |
| Styling   | Custom CSS (no framework)           |

---

## Features

- **Property Listings** — Browse, search, filter, and sort properties for sale or rent
- **Map View** — Interactive Leaflet map with price pins; pan/zoom to filter listings by bounding box
- **Advanced Filters** — Type, listing type, city, bedrooms, bathrooms, price range
- **Image Uploads** — Cover image + gallery with storage via Laravel public disk
- **Favorite Properties** — Toggle heart icon to save/unsave listings
- **Booking Requests** — Request a viewing or rental booking with date selection
- **Owner Dashboard** — Accept/reject bookings, manage own listings
- **Authentication** — Register/login with Sanctum token auth

---

## Project Structure

```
Real Estate Property System/
├── backend/          ← Laravel API (port 8000)
└── frontend/         ← React + Vite (port 5173)
```

---

## Quick Start

### Prerequisites
- PHP 8.1+, Composer
- Node.js 18+, npm
- MySQL (create database `realestate_db`)

---

### 1. Backend Setup

```bash
cd backend

# Install dependencies
composer install

# Environment
cp .env.example .env       # Already configured — update DB_PASSWORD if needed
php artisan key:generate

# Database
php artisan migrate --seed

# Storage link (for image uploads)
php artisan storage:link

# Start server
php artisan serve
# → API running at http://localhost:8000
```

> **Demo accounts** seeded automatically:
> - `owner@realestate.com` / `password`
> - `buyer@realestate.com` / `password`

---

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
# → App running at http://localhost:5173
```

---

## API Endpoints

### Auth
| Method | Endpoint       | Description          |
|--------|----------------|----------------------|
| POST   | /api/register  | Register new user    |
| POST   | /api/login     | Login → returns token|
| POST   | /api/logout    | Revoke token (auth)  |
| GET    | /api/me        | Get current user     |

### Properties
| Method | Endpoint                        | Auth | Description            |
|--------|---------------------------------|------|------------------------|
| GET    | /api/properties/public          | No   | List properties        |
| GET    | /api/properties                 | Yes  | List + favorited flag  |
| GET    | /api/properties/{id}            | No   | Property detail        |
| POST   | /api/properties                 | Yes  | Create listing         |
| PUT    | /api/properties/{id}            | Yes  | Update listing         |
| DELETE | /api/properties/{id}            | Yes  | Delete listing         |
| GET    | /api/my-listings                | Yes  | Owner's listings       |
| DELETE | /api/property-images/{imageId}  | Yes  | Remove gallery image   |

### Favorites
| Method | Endpoint                  | Auth | Description            |
|--------|---------------------------|------|------------------------|
| GET    | /api/favorites            | Yes  | My saved properties    |
| POST   | /api/favorites/{id}       | Yes  | Toggle favorite        |

### Bookings
| Method | Endpoint                          | Auth | Description          |
|--------|-----------------------------------|------|----------------------|
| POST   | /api/properties/{id}/bookings     | Yes  | Submit request       |
| GET    | /api/my-bookings                  | Yes  | My requests          |
| GET    | /api/owner-bookings               | Yes  | Incoming requests    |
| PUT    | /api/bookings/{id}/status         | Yes  | Accept/reject        |

### Filter Query Params (GET /api/properties/public)
```
?search=        text search (title, address, city)
?type=          house|apartment|condo|villa|studio|land
?listing_type=  sale|rent
?city=          city name
?min_price=     number
?max_price=     number
?bedrooms=      min bedrooms
?bathrooms=     min bathrooms
?status=        available|sold|rented|pending
?featured=      true
?bounds=        sw_lat,sw_lng,ne_lat,ne_lng  (map bounding box)
?per_page=      results per page (default 12)
?page=          page number
```

---

## Screenshots

| Page            | URL                    |
|-----------------|------------------------|
| Home            | /                      |
| Listings        | /properties            |
| Map View        | /map                   |
| Property Detail | /properties/:id        |
| Create Listing  | /my-listings/new       |
| My Saved        | /favorites             |
| My Bookings     | /my-bookings           |
| Owner Bookings  | /owner-bookings        |

---

## GIS / Mapping Notes

- All properties store `latitude` and `longitude` (decimal degrees)
- Map uses **OpenStreetMap** tiles via Leaflet
- Price-label map markers (not default pins)
- **Bounding box filter**: when the user pans/zooms the map, only properties within the visible bounds are fetched from the API (`?bounds=sw_lat,sw_lng,ne_lat,ne_lng`)
- **LocationPicker** component lets property owners click the map to set exact coordinates when creating/editing a listing

---

## Environment Variables

`backend/.env` key settings:
```env
DB_DATABASE=realestate_db
DB_USERNAME=root
DB_PASSWORD=

SANCTUM_STATEFUL_DOMAINS=localhost:5173,localhost:3000
FILESYSTEM_DISK=public
```
