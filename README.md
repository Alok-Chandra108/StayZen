# ✈ StayZen — Retro Pan Am Luggage Tag Edition

> **Premium stays. Bold design. Unforgettable journeys.**

StayZen is a full-stack accommodation booking platform built with the **Retro Pan Am Luggage Tag** design language — a theme inspired by the golden age of air travel. Vintage luggage tags, boarding pass aesthetics, navy-and-teal palettes, barcode motifs, and paper-cut shadows define every page.

---

## 📑 Table of Contents

- [Design Language](#-design-language--retro-pan-am)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [Project Structure](#-project-structure)
- [CSS Architecture](#-css-architecture)
- [API Endpoints](#-api-endpoints)
- [How It Works](#-how-it-works)
- [Security](#-security)
- [Deployment](#-deployment)
- [ Contributing](#-contributing)

---

## 🎨 Design Language — Retro Pan Am

Every page in StayZen is wrapped in a cohesive, vintage aviation aesthetic:

| Element | Description |
|---------|-------------|
| **Luggage Tags** | Cards styled with holes, strings, and stitched borders |
| **Boarding Pass** | Dotted tear lines separating content sections |
| **Barcodes** | Animated barcode strips decorating headers and footers |
| **Stamp Overlays** | Vintage-style tags (PARIS, TOKYO, FIRST CLASS, VIP) |
| **Color Palette** | Teal `#00838F`, Navy `#1A237E`, Red `#D32F2F`, Gold `#FFB300`, Cream `#FAFAFA` |
| **Typography** | Space Grotesk (headings) + JetBrains Mono (monospaced accents) |
| **Shadows** | Offset box shadows (red or navy) giving a physical, paper-cut feel |
| **Transitions** | GSAP-powered entrance animations and scroll-triggered reveals |

---

## ⚡ Features

### Core Booking Engine
- **Property Listings** — Browse curated stays with image galleries, ratings, and interactive maps
- **Advanced Search & Filtering** — Text search, 10 category filters, and date-range availability chained together
- **Booking System** — Flatpickr-powered date selection with overlap prevention; instant confirmation with downloadable boarding-pass-style tickets
- **Review System** — Star ratings and written reviews for every listing

### Authentication & Security
- **Email/OTP Registration** — Verified signup with styled email templates (Pan Am boarding pass design)
- **Google OAuth 2.0** — One-click sign-in with smart account linking
- **Session Security** — Helmet, express-mongo-sanitize, XSS sanitization, rate limiting

### Interactive Maps
- **Leaflet.js** with custom Pan Am-themed markers
- **Geocoding** via Nominatim API for every listing location

### Dashboards
- **My Bookings** — Ticket-style cards with QR codes, property images, and one-click download
- **Host Dashboard** — Earnings summary, filtering (monthly/weekly/today), Chart.js analytics, property management

### Pages Themed
| Page | Theme Status |
|------|-------------|
| Login / Signup | ✅ Retro Pan Am |
| Verify OTP | ✅ Retro Pan Am |
| Listings Grid | ✅ Retro Pan Am |
| Listing Detail | ✅ Retro Pan Am |
| New / Edit Listing | ✅ Retro Pan Am |
| Booking Verification | ✅ Retro Pan Am |
| My Bookings | ✅ Retro Pan Am |
| Host Dashboard | ✅ Retro Pan Am |
| Error Pages | ✅ Retro Pan Am |
| OTP Email Template | ✅ Retro Pan Am |

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Runtime** | Node.js ≥ 22.13.0 |
| **Server** | Express.js |
| **Views** | EJS + ejs-mate layouts |
| **Database** | MongoDB (Mongoose ODM) |
| **Auth** | Passport.js (Local + Google OAuth 2.0) |
| **Image Storage** | Cloudinary |
| **Maps** | Leaflet.js + OpenStreetMap |
| **Geocoding** | Nominatim API |
| **Date Picker** | Flatpickr |
| **Charts** | Chart.js (Host Dashboard) |
| **Animations** | GSAP (GreenSock) + ScrollTrigger |
| **Icons** | Font Awesome 6 |
| **UI Framework** | Bootstrap 5 (grid/utilities) + custom CSS |
| **Fonts** | Google Fonts (Space Grotesk, JetBrains Mono) |
| **Security** | Helmet, express-mongo-sanitize, express-rate-limit, xss-clean |
| **Deployment** | Vercel |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** ≥ 22.13.0
- **MongoDB** instance (local or Atlas)
- **Cloudinary** account (for image uploads)
- **Google OAuth** credentials (optional, for Google sign-in)

### 1. Clone the Repository
```bash
git clone https://github.com/Alok-Chandra108/StayZen.git
cd StayZen
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Create a `.env` file in the project root (see [Environment Variables](#environment-variables) below).

### 4. Seed the Database (Optional)
```bash
node init/index.js
```

### 5. Start the Server
```bash
npm start
```

Server runs at **http://localhost:8080**

---

## 🔧 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGO_URI` | ✅ | MongoDB connection string |
| `SECRET_VAL` | ✅ | Session secret key |
| `CLOUD_NAME` | ✅ | Cloudinary cloud name |
| `CLOUD_API_KEY` | ✅ | Cloudinary API key |
| `CLOUD_API_SECRET` | ✅ | Cloudinary API secret |
| `GOOGLE_CLIENT_ID` | ⬜ | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | ⬜ | Google OAuth client secret |
| `NODE_ENV` | ⬜ | `development` or `production` (defaults to `development`) |

```env
# Database
MONGO_URI=mongodb://localhost:27017/stayzen

# Session
SECRET_VAL=your_session_secret_here

# Cloudinary (image uploads)
CLOUD_NAME=your_cloudinary_cloud_name
CLOUD_API_KEY=your_cloudinary_api_key
CLOUD_API_SECRET=your_cloudinary_api_secret

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# App
NODE_ENV=development
```

---

## 📁 Project Structure

```
StayZen/
├── app.js                      # Express app entry & middleware
├── cloudConfig.js              # Cloudinary configuration
├── schema.js                   # Joi validation schemas
│
├── controllers/                # Route handlers
│   ├── listings.js
│   ├── passes.js               # Booking logic
│   └── ...
│
├── models/                     # Mongoose schemas
│   ├── listing.js
│   ├── booking.js
│   ├── review.js
│   └── user.js
│
├── routes/                     # Express routers
│   ├── listing.js
│   ├── api.js                  # Availability API
│   ├── pass.js
│   └── ...
│
├── middleware/                  # Auth & utility middleware
│   └── auth.js
│
├── views/                      # EJS templates
│   ├── layouts/
│   │   └── boilerplate.ejs     # Master layout
│   ├── includes/
│   │   ├── navbar.ejs          # Pan Am themed navbar
│   │   ├── footer.ejs          # Pan Am themed footer
│   │   └── back-button.ejs     # Navigation bar
│   ├── listings/
│   │   ├── index.ejs           # Listings grid
│   │   ├── show.ejs            # Listing detail
│   │   ├── new.ejs             # Create listing
│   │   └── edit.ejs            # Edit listing
│   ├── users/
│   │   ├── login.ejs           # Login
│   │   ├── signup.ejs          # Signup
│   │   ├── verify-otp.ejs      # OTP verification
│   │   ├── dashboard.ejs       # My Bookings
│   │   ├── host_dashboard.ejs  # Host analytics
│   │   └── verify.ejs          # Booking verification
│   ├── emails/
│   │   └── otpTemplate.ejs     # OTP email (Pan Am design)
│   └── error.ejs               # Error page
│
├── public/                     # Static assets
│   ├── css/
│   │   ├── navbar.css
│   │   ├── footer.css
│   │   ├── listing-grid.css    # Listings page styles
│   │   ├── brutalist-pages.css # Show + form page styles
│   │   ├── brutalist-globals.css
│   │   ├── dashboard.css
│   │   ├── verify.css
│   │   ├── rating.css
│   │   ├── error.css
│   │   └── lug-auth.css        # Shared auth page styles
│   └── js/
│       ├── map.js              # Leaflet map init
│       ├── filters.js          # Search & filter logic
│       ├── nomatch.js          # Empty state handler
│       ├── flatpickr.js        # Date picker init
│       └── animations.js       # GSAP animations
│
├── init/                       # Database seeder
│   ├── data.js
│   └── index.js
│
├── vercel.json                 # Vercel deployment config
└── package.json
```

---

## 🎨 CSS Architecture

StayZen uses a **component-based CSS architecture** with zero inline styles:

| CSS File | Purpose |
|----------|---------|
| `navbar.css` | Pan Am themed navigation bar |
| `footer.css` | Footer with barcode decoration |
| `listing-grid.css` | Listings page: hero, filters, cards, empty state |
| `brutalist-pages.css` | Show page + create/edit forms |
| `dashboard.css` | My Bookings + Host Dashboard |
| `verify.css` | Booking verification page |
| `error.css` | Error page |
| `lug-auth.css` | Shared login/signup/OTP styles |
| `rating.css` | Star rating component |
| `brutalist-globals.css` | Global overrides, flatpickr, utilities |

All styles are loaded via the `boilerplate.ejs` layout with **nonce-based CSP compliance**.

---

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/listings` | List all properties |
| `GET` | `/listings/:id` | View single listing |
| `POST` | `/listings` | Create new listing (auth required) |
| `PUT` | `/listings/:id` | Update listing (owner only) |
| `DELETE` | `/listings/:id` | Delete listing (owner only) |
| `POST` | `/listings/:id/reviews` | Add review (auth required) |
| `DELETE` | `/listings/:id/reviews/:reviewId` | Delete review (author only) |
| `POST` | `/listings/:id/book` | Book a listing (auth required) |
| `GET` | `/bookings` | My Bookings dashboard |
| `GET` | `/verify/:bookingId` | Verify booking (OTP) |
| `POST` | `/verify/:bookingId` | Submit OTP verification |
| `GET` | `/host` | Host Dashboard |
| `GET` | `/api/availability/:listingId` | Check date availability (JSON) |
| `GET` | `/auth/google` | Google OAuth redirect |
| `GET` | `/auth/google/callback` | Google OAuth callback |
| `POST` | `/signup` | Register new account |
| `POST` | `/login` | Email/password login |
| `GET` | `/logout` | Destroy session |

---

## 🔄 How It Works

### User Flow
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   SIGNUP    │────▶│  VERIFY OTP  │────▶│    LOGIN    │
│  (Email +   │     │  (Email      │     │  (Email +   │
│   Password) │     │   Template)  │     │   Password) │
└─────────────┘     └──────────────┘     └─────────────┘
                                              │
                                              ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   BOOKING   │◀────│   LISTING    │◀────│  BROWSE     │
│  (Flatpickr │     │  (Map +      │     │  (Search +  │
│   + OTP)    │     │   Reviews)   │     │   Filters)  │
└─────────────┘     └──────────────┘     └─────────────┘
       │
       ▼
┌─────────────┐     ┌──────────────┐
│  VERIFY     │────▶│   BOARDING   │
│  (OTP)      │     │   PASS       │
└─────────────┘     │  (Download)  │
                    └──────────────┘
```

### Host Flow
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   CREATE    │────▶│   MANAGE     │────▶│  TRACK      │
│   LISTING   │     │  (Edit/Delete│     │  EARNINGS   │
│  (Images +  │     │   Listings)  │     │  (Chart.js) │
│   Details)  │     └──────────────┘     └─────────────┘
└─────────────┘
```

---

## 🔐 Security

- **Helmet** — HTTP headers hardened
- **Content Security Policy** — Nonce-based script/style authorization
- **express-mongo-sanitize** — Prevents NoSQL injection
- **express-rate-limit** — Rate limiting on auth and API routes
- **xss-clean** — XSS attack prevention
- **Session stores** — MongoDB-backed sessions with expiry

---

## 🚢 Deployment

StayZen is optimized for **Vercel**:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/app.js" }]
}
```

- `trust proxy: 1` enabled for Vercel's reverse proxy
- All static assets served from `/public`
- Environment variables configured via Vercel dashboard

---

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Style
- Follow existing conventions
- Use `lug-` prefix for new Pan Am themed CSS classes
- No inline styles — use external CSS files
- All `<script>` and `<style>` tags must include `nonce` attribute
- Run linting before commits

---

## 📄 License

This project is for educational purposes.

---

<div align="center">

**✈ StayZen — Where Every Stay Is a First-Class Journey ✈**

*Raw. Bold. Vintage. Unforgettable.*

</div>
