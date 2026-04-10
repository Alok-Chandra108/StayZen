const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../utils/middleware.js");
const passController = require("../controllers/passes.js");

// POST /listings/:id/bookings -> Create Booking
router.post("/", isLoggedIn, wrapAsync(passController.createBooking));

module.exports = router;
