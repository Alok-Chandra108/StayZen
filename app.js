if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
}

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

// Security: NoSQL Injection Protection
app.use(mongoSanitize());

// Security: Helmet for HTTP Headers
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


app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dos4ag6kt/", 
                "https://images.unsplash.com/",
                "https://unpkg.com/", // For Leaflet tiles
                "https://tile.openstreetmap.org",
                "https://a.tile.openstreetmap.org",
                "https://b.tile.openstreetmap.org",
                "https://c.tile.openstreetmap.org",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Security: Rate Limiting
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: "Too many login/signup attempts from this IP, please try again after 15 minutes",
});
app.use("/login", authLimiter);
app.use("/signup", authLimiter);
app.use("/verify-otp", authLimiter);
app.use("/resend-otp", authLimiter);

// Security: API Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many API requests. Please try again later." },
});
app.use("/api", apiLimiter);


const store  = MongoStore.create({
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
        maxAge: 7 * 24 * 60 * 60 *1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: 'lax'
    }
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy({ usernameField: "email" }, User.authenticate()));

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
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
  