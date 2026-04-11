const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");

module.exports.index = async (req, res) => {
    // 1. Fetch all listings owned by the logged-in user
    const listings = await Listing.find({ owner: req.user._id });
    
    // 2. Fetch all bookings for these listings
    const listingIds = listings.map(l => l._id);
    const bookings = await Booking.find({ listing: { $in: listingIds } })
        .populate("listing")
        .populate("user")
        .sort({ createdAt: -1 });

    // 3. Calculate total simulated earnings
    const totalEarnings = bookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

    // 4. Render the dashboard
    res.render("users/host_dashboard.ejs", { 
        listings, 
        bookings, 
        totalEarnings 
    });
};
