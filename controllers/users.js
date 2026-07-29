const User = require("../models/user.js");
const { sendOTP } = require("../utils/email.js");
const crypto = require("crypto");

function hashOTP(otp) {
    return crypto.createHash('sha256').update(otp).digest('hex');
}

// Failed login tracking middleware
module.exports.failedLoginAttempt = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        
        if (!user) {
            // Create a dummy user to simulate failed attempt
            return next();
        }
        
        if (user && !user.isVerified) {
            return next();
        }
        
        // Increment failed attempts with lockout logic
        const maxAttempts = 5;
        const lockoutTimeMinutes = 30;
        
        if (user.failedLoginAttempts >= maxAttempts && 
            user.lockUntil && user.lockUntil > Date.now()) {
            // Already locked out
            return next();
        }
        
        // Reset lock if time has passed
        if (user.failedLoginAttempts >= maxAttempts && 
            user.lockUntil && user.lockUntil < Date.now()) {
            user.failedLoginAttempts = 0;
            user.lockUntil = undefined;
            await user.save();
        }
        
        // Increment failed attempts
        user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
        
        // Lock account if max attempts reached
        if (user.failedLoginAttempts >= maxAttempts) {
            user.lockUntil = new Date(Date.now() + lockoutTimeMinutes * 60000);
            await user.save();
        } else {
            await user.save();
        }
        
    } catch (err) {
        console.error('Error in failedLoginAttempt middleware:', err);
    }
    
    next();
}