const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const { saveRedirectUrl } = require("../utils/middleware.js");


const userController = require("../controllers/users.js");
const passController = require("../controllers/passes.js");


router.route("/signup")
.get(userController.renderSignupForm)
.post(wrapAsync (userController.signup))

router.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl, passport.authenticate("local", {
    failureRedirect: '/login', 
    failureFlash: { type: 'failure', message: "Username or Password is incorrect!" }
}) ,
    userController.login);

router.get("/logout", userController.logout)

router.get("/verify/:id", wrapAsync(passController.verifyPass))

module.exports = router;

