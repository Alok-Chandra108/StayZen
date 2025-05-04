const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
    res.render("users/signup.ejs");
}

module.exports.signup = async(req, res) => {
    try {
        let { username, email, password } = req.body;
        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            req.flash("failure", "Email is already registered!");
            return res.redirect("/signup");
        }
        const newUser = new User({email, username});
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if(err){
                return next(err);
            }
            req.flash("success", "The user was registered successfully");
            res.redirect("/listings");
        })
    } catch (e) {
        console.log(e)
        req.flash("failure", "A user with a given username is already registered!");
        res.redirect("/signup");
    }
    
}

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs")
}

module.exports.login = async(req, res) => {
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