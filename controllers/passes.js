const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");
const BookingLock = require("../models/lock.js");

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

    // 1. Check for overlapping CONFIRMED/PENDING bookings
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

    // 2. CONCURRENCY GUARD: Check for overlapping ACTIVE LOCKS from other users
    const activeLock = await BookingLock.findOne({
        listing: id,
        user: { $ne: req.user._id }, // Exclude our own locks if we hit refresh, etc.
        checkIn: { $lt: checkOutDate },
        checkOut: { $gt: checkInDate }
    });

    if (activeLock) {
        req.flash("failure", "Access Restricted: Territory currently under negotiation. Try again in 5 minutes.");
        return res.redirect(`/listings/${id}`);
    }

    // 3. Create a Lock to secure the dates while the booking is finalizing
    const lock = new BookingLock({
        listing: id,
        user: req.user._id,
        checkIn: checkInDate,
        checkOut: checkOutDate
    });
    await lock.save();

    try {
        const listing = await Listing.findById(id);
        if (!listing) {
            await BookingLock.findByIdAndDelete(lock._id);
            req.flash("failure", "Target listing missing from records.");
            return res.redirect("/listings");
        }
        
        const diffTime = Math.abs(checkOutDate - checkInDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
        
        const subtotal = diffDays * listing.price;
        const taxRate = 0.18;
        const taxAmount = subtotal * taxRate;
        const totalPrice = subtotal + taxAmount;

        const newBooking = new Booking({
            listing: id,
            user: req.user._id,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            totalPrice: totalPrice
        });

        await newBooking.save();
        
        // 4. Remove the lock upon success
        await BookingLock.findByIdAndDelete(lock._id);

        req.flash("success", `Pass requested! Total with 18% tax: ₹${totalPrice.toLocaleString("en-IN")}. Host must accept.`);
        res.redirect("/dashboard");
    } catch (err) {
        // Cleanup lock if error occurs
        await BookingLock.findByIdAndDelete(lock._id);
        throw err; // Let wrapAsync handle it
    }
};

module.exports.index = async (req, res) => {
    const passes = await Booking.find({ user: req.user._id }).populate("listing").sort({ createdAt: -1 });
    res.render("users/dashboard.ejs", { passes });
};

module.exports.downloadPass = async (req, res) => {
    const PDFDocument = require('pdfkit');
    const QRCode = require('qrcode');
    const { id } = req.params;

    const booking = await Booking.findById(id).populate("listing").populate("user");

    if (!booking) {
        req.flash("failure", "Pass record not found.");
        return res.redirect("/dashboard");
    }

    // Security check: Only the guest or the host of the listing can download the pass
    const isGuest = booking.user._id.equals(req.user._id);
    const isHost = booking.listing.owner.equals(req.user._id);

    if (!isGuest && !isHost) {
        req.flash("failure", "Security Alert: Access to this dossier is restricted.");
        return res.redirect("/dashboard");
    }

    if (booking.status !== 'Confirmed') {
        req.flash("failure", "Dossier incomplete: Pass only available for CONFIRMED status.");
        return res.redirect("/dashboard");
    }

    // Generate QR Code buffer (Booking ID)
    const qrCodeBuffer = await QRCode.toBuffer(booking._id.toString(), {
        color: {
            dark: '#000000',
            light: '#F5F0E8'
        },
        margin: 1,
        width: 120
    });

    const doc = new PDFDocument({
        size: [600, 300], // Horizontal ticket size
        margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=StayZen_Pass_${booking._id}.pdf`);
    doc.pipe(res);

    // --- DRAWING THE BRUTALIST PASS ---
    const CREAM = '#F5F0E8';
    const INK = '#0A0A0A';
    const CORAL = '#FF4500';

    // Background
    doc.rect(0, 0, 600, 300).fill(CREAM);

    // Main Header Bar (Black)
    doc.rect(0, 0, 600, 60).fill(INK);
    doc.fillColor(CREAM)
       .font('Helvetica-Bold')
       .fontSize(18)
       .text('STAYZEN CLEARANCE PASS', 30, 22, { characterSpacing: 2 });
    
    // Subtext at top right
    doc.fontSize(8)
       .text(`ISSUE_ID: ${booking._id.toString().toUpperCase()}`, 400, 28, { align: 'right', width: 170 });

    // --- CONTENT SECTION ---
    doc.fillColor(INK);

    // Listing Title (Huge)
    doc.fontSize(24)
       .text(booking.listing.title.toUpperCase(), 30, 85);

    // Metadata Grid
    doc.fontSize(8).font('Helvetica-Bold').text('LOCATION', 30, 130);
    doc.fontSize(12).text(booking.listing.location.toUpperCase(), 30, 142);

    doc.fontSize(8).text('GUEST dossier', 180, 130);
    doc.fontSize(12).text(booking.user.username.toUpperCase(), 180, 142);

    // Dashed Line Separator
    doc.moveTo(30, 175).lineTo(570, 175).dash(5, { space: 5 }).stroke(INK);

    // Timeline Section
    doc.fontSize(8).text('INFILTRATION DATE', 30, 195);
    doc.fontSize(14).text(booking.checkIn.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(), 30, 210);

    doc.fontSize(8).text('EXFILTRATION DATE', 180, 195);
    doc.fontSize(14).text(booking.checkOut.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(), 180, 210);

    // Financial Breakdown
    const subtotal = booking.totalPrice / 1.18;
    const tax = booking.totalPrice - subtotal;

    doc.fontSize(8).text('FINANCIAL BREAKDOWN', 30, 255);
    doc.fontSize(10)
       .text(`SUBTOTAL: ₹${subtotal.toLocaleString("en-IN")}`, 30, 268)
       .text(`TAX (18%): ₹${tax.toLocaleString("en-IN")}`, 180, 268);

    // Grand Total (Big & Red/Coral)
    doc.fillColor(CORAL).fontSize(16).text(`TOTAL: ₹${booking.totalPrice.toLocaleString("en-IN")}`, 30, 280);

    // --- FOOTER AND QR CODE ---
    // Right Sidebar / Stub effect
    doc.moveTo(480, 60).lineTo(480, 300).dash(2, { space: 2 }).stroke(INK);
    
    // QR Code
    doc.image(qrCodeBuffer, 480, 100, { width: 100, height: 100 });
    
    doc.fillColor(INK).font('Helvetica-Bold').fontSize(7)
       .text('AUTH_KEY', 484, 210, { width: 100, align: 'center' });

    doc.end();
};
