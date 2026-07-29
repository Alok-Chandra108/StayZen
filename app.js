if (process.env.NODE_ENV != "production") {
    require('dotenv').config();
}

// Validate SECRET_VAL at startup
if (!process.env.SECRET_VAL) {
    console.error("FATAL ERROR: SECRET_VAL environment variable is not set!");
    process.exit(1);
}
if (process.env.SECRET_VAL.length < 32) {
    console.error("FATAL ERROR: SECRET_VAL must be at least 32 characters long!");
    process.exit(1);
}

const express = require("express");
const app = express();
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

// HSTS for production
if (process.env.NODE_ENV === "production") {
    app.use((req, res, next) => {
        res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains; preload");
        next();
    });
}

const crypto = require("crypto");

const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
const port = 8080;
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const User = require('./models/user');

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const passRouter = require("./routes/pass.js");
const apiRouter = require("./routes/api.js");

const passport = require('passport');
const LocalStrategy = require("passport-local");
const helmet = require("helmet");
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const moment = require('moment-timezone');



const MONGO_URI = process.env.MONGO_URI;

async function main() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected");

    } catch (err) {
        console.error("MongoDB connection error:", err);
    }
}

main();

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: '1mb' }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")))

// Generate CSP nonce for each request
app.use((req, res, next) => {
    const crypto = require("crypto");
    res.locals.nonce = crypto.randomBytes(16).toString("base64");
    next();
});

// Security: NoSQL Injection Protection
app.use(mongoSanitize());

// Security: Custom CSP with nonce support
const scriptSrcUrls = [
    "https://cdn.jsdelivr.net",
    "https://unpkg.com",
    "https://cdnjs.cloudflare.com",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net",
    "https://unpkg.com",
    "https://fonts.googleapis.com",
    "https://cdnjs.cloudflare.com",
];
const connectSrcUrls = [
    "https://unpkg.com",
    "https://cdn.jsdelivr.net",
];
const fontSrcUrls = [
    "https://fonts.gstatic.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];

app.use((req, res, next) => {
    const nonce = res.locals.nonce;
    res.locals.cspNonce = nonce;
    const csp = [
        "default-src 'none'",
        `script-src 'nonce-${nonce}' 'self' ${scriptSrcUrls.join(" ")}`,
        `style-src 'nonce-${nonce}' 'self' ${styleSrcUrls.join(" ")}`,
        `connect-src 'self' ${connectSrcUrls.join(" ")}`,
        "worker-src 'self' blob:",
        "object-src 'none'",
        `img-src 'self' blob: data: https://res.cloudinary.com/dos4ag6kt/ https://images.unsplash.com/ https://unpkg.com/ https://tile.openstreetmap.org https://a.tile.openstreetmap.org https://b.tile.openstreetmap.org https://c.tile.openstreetmap.org`,
        `font-src 'self' ${fontSrcUrls.join(" ")}`,
    ].join("; ");
    res.setHeader("Content-Security-Policy", csp);
    next();
});

// Enhanced helmet security headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'none'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://images.unsplash.com"],
            fontSrc: ["'self'"],
            connectSrc: ["'self'", "https://api.leaflet.org", "https://tile.openstreetmap.org", "https://nominatim.openstreetmap.org"],
            frameAncestors: ["'none'"],
            baseUri: ["'self'"],
            formAction: ["'self'"],
            upgradeInsecureRequests: [],
        },
    },
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "same-site" },
    dnsPrefetchControl: { allow: false },
    hidePoweredBy: true,
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    },
    noSniff: true,
    originAgentCluster: false,
    permissionsPolicy: {
        features: {
            camera: ["none"],
            microphone: ["none"],
            geolocation: ["self"],
            payment: ["none"],
            usb: ["none"]
        }
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xssFilter: true,
    contentTypeOptions: true
}));

// Enhanced Rate Limiting - Multiple tiers for different endpoints
const authAndPublicRoutesLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per IP
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests from this IP. Please try again later." },
    keyGenerator: (req) => req.ip + (req.query.listingId || ''), // per-endpoint
    skip: (req) => req.path.startsWith('/api/listings/'), // API has its own limiter
});

// Listing endpoints specific rate limiting
const listingRoutesLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200, // Listings are more critical endpoint
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many requests for listings. Please try again later." }
});

// API rate limiting with per-IP tracking
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200, // More requests for API flexibility
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many API requests. Please try again later." },
    keyGenerator: (req) => req.ip
});

// Apply rate limiting
app.use('/api/listings', apiLimiter);           // API routes have own protection
app.use('/dashboard', listingRoutesLimiter);   // Dashboard routes need protection
app.use(listingRoutesLimiter);                 // Listings page routes
app.use(listingRoutesLimiter);                 // New listings form
app.use('/listings', listingRoutesLimiter);    // All listing routes

// Enhanced auth rate limiting
app.use('/login', authAndPublicRoutesLimiter);
app.use('/signup', authAndPublicRoutesLimiter);
app.use('/verify-otp', authAndPublicRoutesLimiter);
app.use('/resend-otp', authAndPublicRoutesLimiter);


const store = MongoStore.create({
    mongoUrl: MONGO_URI,
    crypto: {
        secret: process.env.SECRET_VAL,
    },
    touchAfter: 24 * 3600,
});

store.on("error", (err) => {
    console.error("ERROR in Mongo Session Store:", err);
})

const sessionOptions = {
    store,
    secret: process.env.SECRET_VAL,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'lax'
    }
};

const csrf = require("csurf");

app.use(session(sessionOptions));
app.use(flash());

// CSRF Protection (after session, before routes)
const csrfProtection = csrf({ cookie: false });
app.use(csrfProtection);

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_TIME_MINUTES = 30;

app.use((req, res, next) => {
    res.locals.csrfToken = req.csrfToken();
    next();
});

// Reset failed attempts on logout
app.use((req, res, next) => {
    if (req.path === '/logout' && req.session && req.session.passport && req.session.passport.user) {
        User.findByIdAndUpdate(req.session.passport.user, {
            failedLoginAttempts: 0,
            lockUntil: undefined
        }).catch(err => console.error('Error resetting lock after logout:', err));
    }
    next();
});

const failedLoginAttempt = require('./controllers/users').failedLoginAttempt;
app.use(passport.initialize());
app.use(passport.session());

// Apply failed login tracking middleware to login route only
app.use('/login', failedLoginAttempt);
passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));

// Google OAuth Strategy (only if credentials are configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(new GoogleStrategy({
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "/auth/google/callback",
        proxy: true
    },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // 1. Check if user already exists with this googleId
                let user = await User.findOne({ googleId: profile.id });

                if (user) {
                    return done(null, user);
                }

                // 2. If not, check if user exists with the same email
                const email = profile.emails[0].value;
                user = await User.findOne({ email: email });

                if (user) {
                    // Link accounts: Add googleId and verify
                    user.googleId = profile.id;
                    user.isVerified = true;
                    await user.save();
                    return done(null, user);
                }

                // 3. Create new user
                const newUser = new User({
                    googleId: profile.id,
                    username: profile.displayName || email.split('@')[0],
                    email: email,
                    isVerified: true
                });

                // For passport-local-mongoose, we need to register or just save if no password
                // Using save() since they don't have a local password yet
                await newUser.save();
                return done(null, newUser);

            } catch (err) {
                return done(err, null);
            }
        }
    ));
} else {
    console.warn("Google OAuth credentials not found. Google Sign-In is disabled.");
}

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.failure = req.flash("failure");
    res.locals.currUser = req.user;
    res.locals.currentPath = req.originalUrl;
    next();
});

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/listings/:id/bookings", passRouter);
app.use("/api/listings", apiRouter);

const passController = require("./controllers/passes.js");
const hostController = require("./controllers/hosts.js");
const { isLoggedIn } = require("./utils/middleware.js");
app.get("/dashboard", isLoggedIn, require("./utils/wrapAsync.js")(passController.index));
app.get("/host-dashboard", isLoggedIn, require("./utils/wrapAsync.js")(hostController.index));
app.get("/dashboard/bookings/:id/pass", isLoggedIn, require("./utils/wrapAsync.js")(passController.downloadPass));


app.use("/", userRouter);


app.all("*", (req, res, next) => {
    // Silently dismiss common browser auto-requests that flood the terminal
    const noisyPaths = ["/favicon.ico", "/apple-touch-icon", "/.well-known"];
    const isNoisy = noisyPaths.some(path => req.originalUrl.startsWith(path));

    if (isNoisy) {
        return res.status(204).end();
    }

    console.warn(`[404] Missing Resource: ${req.originalUrl}`);
    next(new ExpressError(404, "Page Not Found!!"));
});

// Error handling middleware (must come last)
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    console.error(`[ERROR] ${statusCode} - ${message}`);
    if (process.env.NODE_ENV !== "production") {
        console.error(err.stack);
    }
    res.status(statusCode).render("error.ejs", { err, message });
});


if (require.main === module) {
    app.listen(port, () => {
        console.log(`Server running on port ${port}`);
    });
}

module.exports = app;
