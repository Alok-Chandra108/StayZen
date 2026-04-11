const express = require("express");
const router = express.Router();
const Booking = require("../models/booking");

// GET /api/listings/available?checkIn=YYYY-MM-DD&checkOut=YYYY-MM-DD
// Returns { unavailableIds: ["id1", "id2", ...] }
router.get("/available", async (req, res) => {
    try {
        const { checkIn, checkOut } = req.query;

        if (!checkIn || !checkOut) {
            return res.status(400).json({ error: "checkIn and checkOut query params are required" });
        }

        const startDate = new Date(checkIn);
        const endDate = new Date(checkOut);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({ error: "Invalid date format. Use YYYY-MM-DD." });
        }

        if (endDate <= startDate) {
            return res.status(400).json({ error: "checkOut must be after checkIn." });
        }

        // Find all bookings that overlap with the requested date range
        // Overlap condition: booking.checkIn < requestedCheckOut AND booking.checkOut > requestedCheckIn
        const overlappingBookings = await Booking.find({
            checkIn: { $lt: endDate },
            checkOut: { $gt: startDate }
        }).select("listing");

        // Extract unique listing IDs that are unavailable
        const unavailableIds = [...new Set(
            overlappingBookings.map(b => b.listing.toString())
        )];

        res.json({ unavailableIds });
    } catch (err) {
        console.error("API /available error:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;
