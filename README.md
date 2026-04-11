# StayZen ✦ Raw Escapes, Unapologetic Spaces

StayZen is not your typical booking platform. It's a high-octane, **Neu-Brutalist** accommodation engine built for those who find beauty in the raw, the bold, and the unapologetic. 

Forget "minimalism." StayZen embraces **Brutal Luxe**—combining stark, high-contrast layouts with a premium experience.

---

## ⚡ THE AESTHETIC: NEU-BRUTALISM
StayZen is defined by its radical design language:
- **Massive Typography:** Aggressive headers that demand attention.
- **Harsh Contrast:** A clash of neon limes, deep lavenders, and pitch blacks.
- **Structural Integrity:** Stark borders, thick shadows, and scrolling marquees that break the traditional web grid.
- **High Friction, High Reward:** A UI that feels physical, interactive, and alive.

---

## 🛠 TECH SLAB
StayZen is powered by a robust, server-side rendered engine:
- **Core:** Node.js & Express.js
- **Views:** EJS (Embedded JavaScript) with `ejs-mate` layouts
- **Database:** MongoDB (via Mongoose)
- **Auth:** Passport.js (Local Strategy)
- **Geocoding:** Nominatim API for spatial coordinates
- **Maps:** Leaflet.js with interactive markers
- **Date Picker:** Flatpickr for booking calendars and availability filtering
- **Security:** Helmet, express-mongo-sanitize, rate limiting
- **Staging/Production:** Fully optimized for Vercel deployment

---

## 🚀 KEY PROTOCOLS
- **Authentication:** Secure user silos for listing management and interactions.
- **CRUD Operations:** Total control over property listings with image persistence.
- **Review System:** An unfiltered feedback loop with star ratings for every space.
- **Interactive Maps:** Real-world orientation for every listing via Leaflet.
- **Booking System:** Flatpickr-powered date selection with overlap prevention. Reserve "Clearance Passes" for stays, viewable in a personal dashboard.
- **Advanced Search & Filtering:**
  - **Text Search:** Real-time title filtering from the navbar.
  - **Category Filters:** 10 "Browse by" categories (Trending, Rooms, Mountains, Castles, Pools, etc.) synced to listing tags.
  - **Date-Range Availability:** Select check-in/check-out dates to hide listings that are already booked — powered by a dedicated API endpoint.
  - All three filters chain together seamlessly.

---

## 📦 INITIALIZE
To fire up the engine locally:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Alok-Chandra108/StayZen.git
   cd StayZen
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure the environment:**
   Create a `.env` file in the root and define your variables.
   ```env
   MONGO_URI=your_mongodb_uri
   SECRET_VAL=your_session_secret
   CLOUD_NAME=your_cloudinary_cloud_name
   CLOUD_API_KEY=your_cloudinary_api_key
   CLOUD_API_SECRET=your_cloudinary_api_secret
   ```

4. **Seed the database (optional):**
   ```bash
   node init/index.js
   ```

5. **Launch:**
   ```bash
   npm start
   ```
   The server runs at `http://localhost:8080`.

---

## 📁 PROJECT STRUCTURE
```
StayZen/
├── app.js                  # Express app entry point
├── cloudConfig.js          # Cloudinary configuration
├── schema.js               # Joi validation schemas
├── controllers/            # Route handlers
│   ├── listings.js
│   ├── passes.js           # Booking (pass) logic
│   └── ...
├── models/                 # Mongoose schemas
│   ├── listing.js
│   ├── booking.js
│   ├── review.js
│   └── user.js
├── routes/                 # Express routers
│   ├── listing.js
│   ├── api.js              # Availability API endpoint
│   ├── pass.js
│   └── ...
├── views/                  # EJS templates
│   ├── layouts/
│   ├── listings/
│   └── includes/
├── public/                 # Static assets
│   ├── css/
│   └── js/
├── init/                   # Database seeder
│   ├── data.js
│   └── index.js
└── vercel.json             # Vercel deployment config
```

---

## ✦ STAYZEN
*Raw. Bold. Brutal.*
