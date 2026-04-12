const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl, isLoggedIn } = require("../utils/middleware.js");

const userController = require("../controllers/users.js");
const passController = require("../controllers/passes.js");

router.route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

router.route("/login")
    .get(userController.renderLoginForm)
    .post(
        saveRedirectUrl, 
        passport.authenticate("local", {
            failureRedirect: '/login', 
            failureFlash: { type: 'failure', message: "Email or Password is incorrect!" }
        }),
        wrapAsync(userController.login)
    );

router.route("/verify-otp")
    .get(userController.renderVerifyForm)
    .post(wrapAsync(userController.verifyOTP));

router.post("/resend-otp", wrapAsync(userController.resendOTP));

router.get("/logout", userController.logout);

// ✦ Google Auth Protocol (Initiate)
router.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// ✦ Google Auth Callback
router.get("/auth/google/callback", 
    passport.authenticate("google", { failureRedirect: "/login", failureFlash: true }), 
    (req, res) => {
        req.flash("success", `Welcome back, ${req.user.username}!`);
        let redirectUrl = res.locals.redirectUrl || "/listings";
        res.redirect(redirectUrl);
    }
);

router.get("/verify/:id", isLoggedIn, wrapAsync(passController.verifyPass));

module.exports = router;
