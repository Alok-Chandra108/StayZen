# ✈ StayZen — Retro Pan Am Luggage Tag Edition

> **Premium stays. Bold design. Unforgettable journeys.**

StayZen is a full-stack accommodation booking platform built with the **Retro Pan Am Luggage Tag** design language — a theme inspired by the golden age of air travel. Vintage luggage tags, boarding pass aesthetics, navy-and-teal palettes, barcode motifs, and paper-cut shadows define every page.

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
Create a `.env` file in the project root:

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

## 📄 License

This project is for educational purposes.

---

<div align="center">

**✈ StayZen — Where Every Stay Is a First-Class Journey ✈**

*Raw. Bold. Vintage. Unforgettable.*

</div>
