const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");

module.exports.index = async (req, res) => {
    // Fetch all listings owned by the logged-in user
    const listings = await Listing.find({ owner: req.user._id });
    const listingIds = listings.map(l => l._id);
    
    // Fetch all bookings for these listings
    const bookings = await Booking.find({ listing: { $in: listingIds } })
        .populate("listing")
        .populate("user")
        .sort({ createdAt: -1 });

    const today = new Date();
    today.setHours(0,0,0,0);

    const upcomingBookings = bookings.filter(b => new Date(b.checkOut) >= today);
    const pastBookings = bookings.filter(b => new Date(b.checkOut) < today);

    const { startDate, endDate } = req.query;
    
    // Only calculate earnings for confirmed bookings (missing status implies older confirmed data)
    let yieldBookings = bookings.filter(b => (!b.status || b.status === "Confirmed"));

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
        yieldBookings = yieldBookings.filter(b => {
             const checkOut = new Date(b.checkOut);
             return checkOut >= start && checkOut <= end;
        });
    }

    const totalEarnings = yieldBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

    // Pass searchQuery explicitly to avoid any potential conflict with 'query'
    res.render("users/host_dashboard.ejs", { 
        listings, 
        upcomingBookings,
        pastBookings,
        totalEarnings,
        searchQuery: req.query || {}
    });
};

module.exports.acceptBooking = async (req, res) => {
    const { id } = req.params;
    await Booking.findByIdAndUpdate(id, { status: 'Confirmed' });
    req.flash("success", "Reservation Confirmed.");
    res.redirect("/host-dashboard");
};

module.exports.declineBooking = async (req, res) => {
    const { id } = req.params;
    await Booking.findByIdAndUpdate(id, { status: 'Declined' });
    req.flash("success", "Reservation Declined.");
    res.redirect("/host-dashboard");
};
