if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
const port = process.env.PORT || 3000;
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const User = require('./models/user');

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const passport = require('passport');
const LocalStrategy = require("passport-local");



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
        httpOnly: true
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
    next();
});

// app.get("/demouser", async(req, res) => {
//     let fakeuser = new User({
//         email: "student101@gmail.com",
//         username: "alpha-stud"
//     });
//     let registeredUser = await User.register(fakeuser, "hellostud");
//     res.send(registeredUser);
// });

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!!"));
});

// Error handling middleware (must come last)
app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("error.ejs", { err })
    // res.status(statusCode).send(message);
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  