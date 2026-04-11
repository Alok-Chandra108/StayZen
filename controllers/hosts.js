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
    
    // 1. Yield for the Summary Card and Tables (All bookings are now auto-confirmed)
    let filteredBookings = bookings;

    if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        start.setHours(0,0,0,0);
        end.setHours(23,59,59,999);
        filteredBookings = filteredBookings.filter(b => {
             const checkOut = new Date(b.checkOut);
             return checkOut >= start && checkOut <= end;
        });
    }
    const totalEarnings = filteredBookings.reduce((sum, booking) => sum + booking.totalPrice, 0);

    // 2. Historical Yield (All bookings)
    const confirmedBookings = bookings;


    // --- ANALYTICS AGGREGATION ---
    // 1. Monthly Yield (Last 6 Months - Always show full history)
    const monthlyYield = [];
    for (let i = 0; i < 6; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - (5 - i));
        const monthName = d.toLocaleString('default', { month: 'short' }).toUpperCase();
        const year = d.getFullYear();
        
        const monthTotal = confirmedBookings.reduce((sum, b) => {
            const checkOut = new Date(b.checkOut);
            if (checkOut.getMonth() === d.getMonth() && checkOut.getFullYear() === d.getFullYear()) {
                return sum + b.totalPrice;
            }
            return sum;
        }, 0);

        monthlyYield.push({ month: `${monthName} ${year}`, total: monthTotal });
    }

    // 2. Listing Performance (Yield by Asset - Overall)
    const listingPerformance = listings.map(listing => {
        const yieldForListing = confirmedBookings
            .filter(b => b.listing._id.equals(listing._id))
            .reduce((sum, b) => sum + b.totalPrice, 0);
        return { title: listing.title, yield: yieldForListing };
    }).sort((a, b) => b.yield - a.yield);

    // 3. Occupancy Density (Current Month)
    const currentMonthStart = new Date();
    currentMonthStart.setDate(1);
    currentMonthStart.setHours(0,0,0,0);
    const nextMonthStart = new Date(currentMonthStart);
    nextMonthStart.setMonth(nextMonthStart.getMonth() + 1);
    
    const daysInMonth = Math.round((nextMonthStart - currentMonthStart) / (1000 * 60 * 60 * 24));
    
    let totalBookedDays = 0;
    confirmedBookings.forEach(b => {
        const start = new Date(b.checkIn);
        const end = new Date(b.checkOut);
        
        // Overlap with current month
        const overlapStart = new Date(Math.max(start, currentMonthStart));
        const overlapEnd = new Date(Math.min(end, nextMonthStart));
        
        if (overlapEnd > overlapStart) {
            const diff = Math.round((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24));
            totalBookedDays += diff;
        }
    });

    const totalCapacityDays = listings.length * daysInMonth;
    const occupancyRate = totalCapacityDays > 0 ? ((totalBookedDays / totalCapacityDays) * 100).toFixed(1) : 0;

    res.render("users/host_dashboard.ejs", { 
        listings, 
        upcomingBookings,
        pastBookings,
        totalEarnings,
        monthlyYield,
        listingPerformance,
        occupancyRate,
        searchQuery: req.query || {}
    });
    });
};

