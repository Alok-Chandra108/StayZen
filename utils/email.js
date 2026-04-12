const nodemailer = require("nodemailer");
const ejs = require("ejs");
const path = require("path");

const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

module.exports.sendOTP = async (email, otp, username) => {
    try {
        const isProduction = process.env.NODE_ENV === "production";
        const hasCredentials = process.env.EMAIL_USER && 
                             process.env.EMAIL_PASS && 
                             !process.env.EMAIL_USER.includes("your-email") &&
                             !process.env.EMAIL_PASS.includes("your-app-password");

        // Fallback to console log ONLY in development
        if (!hasCredentials && !isProduction) {
            console.log("==========================================");
            console.log(`[DEV MODE] OTP for ${username} (${email}): ${otp}`);
            console.log("==========================================");
            return;
        }

        // In production, we strictly require valid credentials
        if (!hasCredentials && isProduction) {
            throw new Error("SMTP credentials missing in Production environment.");
        }

        const templatePath = path.join(__dirname, "../views/emails/otpTemplate.ejs");
        const html = await ejs.renderFile(templatePath, { otp, username });

        const mailOptions = {
            from: `"StayZen Support" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: "Verify Your StayZen Account",
            html: html
        };

        try {
            await transporter.sendMail(mailOptions);
            console.log(`OTP sent to ${email}`);
        } catch (mailErr) {
            console.log("==========================================");
            console.log("NOTICE: Email sending failed. Falling back to console log.");
            console.log(`[FALLBACK] OTP for ${username} (${email}): ${otp}`);
            console.log(`REASON: ${mailErr.message}`);
            console.log("==========================================");
        }
    } catch (err) {
        console.error("Critical error in OTP utility:", err);
        // We still fallback one last time if something else failed (like template rendering)
        console.log(`[CRITICAL FALLBACK] OTP: ${otp}`);
    }
};
