const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");

module.exports.createBooking = async (req, res) => {
    const { id } = req.params; // Listing ID
    const { checkIn, checkOut } = req.body; 
    
    // basic validation
    if(!checkIn || !checkOut) {
        req.flash("failure", "Dates must be provided.");
        return res.redirect(`/listings/${id}`);
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if(checkInDate >= checkOutDate) {
        req.flash("failure", "Check-out must be after Check-in.");
        return res.redirect(`/listings/${id}`);
    }

    // Convert dates to ignoring time for accurate overlap checks
    checkInDate.setHours(0,0,0,0);
    checkOutDate.setHours(0,0,0,0);

    // Check for overlapping dates
    const overlappingBookings = await Booking.find({
        listing: id,
        status: { $ne: 'Declined' },
        $or: [
            { checkIn: { $lt: checkOutDate }, checkOut: { $gt: checkInDate } }
        ]
    });

    if (overlappingBookings.length > 0) {
        req.flash("failure", "Those dates are already secured by someone else.");
        return res.redirect(`/listings/${id}`);
    }

    const listing = await Listing.findById(id);
    if (!listing) {
        req.flash("failure", "Target listing missing from records.");
        return res.redirect("/listings");
    }
    const diffTime = Math.abs(checkOutDate - checkInDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    const totalPrice = diffDays * listing.price;

    const newBooking = new Booking({
        listing: id,
        user: req.user._id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        totalPrice: totalPrice
    });

    await newBooking.save();

    req.flash("success", "Pass requested! Host must accept to secure your space.");
    res.redirect("/dashboard");
};

module.exports.index = async (req, res) => {
    const passes = await Booking.find({ user: req.user._id }).populate("listing").sort({ createdAt: -1 });
    res.render("users/dashboard.ejs", { passes });
};
