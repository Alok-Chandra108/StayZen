if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
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
];
const fontSrcUrls = [
    "https://fonts.gstatic.com",
    "https://cdnjs.cloudflare.com",
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


const store  = MongoStore.create({
    mongoUrl: MONGO_URI,
    crypto: {
        secret: process.env.SECRET_VAL,
    },
    touchAfter: 24 * 3600,
});

store.on("error", () => {
    console.log("ERRROR in Mongo Sesssion Store", err);
})

const sessionOptions = {
    store,
    secret: process.env.SECRET_VAL,
    resave: false,
    saveUninitialized: true,
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
passport.use(new LocalStrategy(User.authenticate()));

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
const { isLoggedIn } = require("./utils/middleware.js");
app.get("/dashboard", isLoggedIn, require("./utils/wrapAsync.js")(passController.index));

app.use("/", userRouter);


app.all("*", (req, res, next) => {
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
  