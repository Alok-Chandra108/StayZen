const User = require("../models/user.js");
const { sendOTP } = require("../utils/email.js");
const crypto = require("crypto");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.signup = async(req, res) => {
    try {
        let { username, email, password } = req.body;
        
        // Check if email already exists
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            req.flash("failure", "Email is already registered!");
            return res.redirect("/signup");
        }

        // Generate OTP
        const otp = crypto.randomInt(100000, 999999).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const newUser = new User({
            email, 
            username, 
            otp, 
            otpExpires, 
            isVerified: false 
        });

        const registeredUser = await User.register(newUser, password);
        
        // Send OTP via email
        await sendOTP(email, otp, username);

        req.flash("success", "A verification code has been sent to your email.");
        res.redirect(`/verify-otp?email=${email}`);
        
    } catch (e) {
        console.log(e);
        req.flash("failure", e.message);
        res.redirect("/signup");
    }
}

module.exports.renderVerifyForm = (req, res) => {
    const { email } = req.query;
    if (!email) {
        req.flash("failure", "Invalid request.");
        return res.redirect("/signup");
    }
    res.render("users/verify-otp.ejs", { email });
}

module.exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            req.flash("failure", "User not found.");
            return res.redirect("/signup");
        }

        if (user.isVerified) {
            req.flash("success", "Account already verified. Please login.");
            return res.redirect("/login");
        }

        if (user.otp !== otp || user.otpExpires < Date.now()) {
            req.flash("failure", "Invalid or expired OTP.");
            return res.redirect(`/verify-otp?email=${email}`);
        }

        user.isVerified = true;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        req.login(user, (err) => {
            if (err) return next(err);
            req.flash("success", "Account verified successfully! Welcome to StayZen.");
            res.redirect("/listings");
        });

    } catch (e) {
        req.flash("failure", e.message);
        res.redirect("/signup");
    }
}

module.exports.resendOTP = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            req.flash("failure", "User not found.");
            return res.redirect("/signup");
        }

        const otp = crypto.randomInt(100000, 999999).toString();
        user.otp = otp;
        user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
        await user.save();

        await sendOTP(email, otp, user.username);

        req.flash("success", "A new verification code has been sent.");
        res.redirect(`/verify-otp?email=${email}`);

    } catch (e) {
        req.flash("failure", "Could not resend OTP. Please try again.");
        res.redirect("/signup");
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs")
}

module.exports.login = async(req, res) => {
    // Check if user is verified
    if (!req.user.isVerified) {
        const email = req.user.email;
        req.logout((err) => {
            if (err) return next(err);
            req.flash("failure", "Your account is not verified. Please verify your email.");
            return res.redirect(`/verify-otp?email=${email}`);
        });
        return;
    }

    req.flash("success", "Welcome to StayZen! You are logged in");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl)
}

module.exports.logout = (req, res, next) => {
    req.logout((err) => {
        if(err){
            return next(err);
        }
        req.flash("success", "You are logged out now");
        res.redirect("/listings");
    })
}