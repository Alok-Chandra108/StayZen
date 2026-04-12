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

        req.flash("success", `Pass secured! Total with 18% tax: ₹${totalPrice.toLocaleString("en-IN")}. Your clearance is confirmed.`);
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



    // Generate QR Code data (URL ONLY for auto-redirection)
    const protocol = req.protocol;
    const host = req.get('host');
    const verifyUrl = `${protocol}://${host}/verify/${booking._id}`;
    
    const qrCodeBuffer = await QRCode.toBuffer(verifyUrl, {

        color: {
            dark: '#000000',
            light: '#F5F0E8'
        },
        margin: 1,
        width: 150
    });


    const doc = new PDFDocument({
        size: [800, 400], // Increased Width and Height
        margins: { top: 0, bottom: 0, left: 0, right: 0 }
    });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=StayZen_Pass_${booking._id}.pdf`);
    doc.pipe(res);

    // --- DESIGN TOKENS ---
    const CREAM = '#F5F0E8';
    const INK = '#0A0A0A';
    const CORAL = '#FF4500';
    const LIME = '#CCFF00';

    // Background
    doc.rect(0, 0, 800, 400).fill(CREAM);

    // 1. TOP MARQUEE (Black Header)
    doc.rect(0, 0, 800, 70).fill(INK);
    doc.fillColor(CREAM)
       .font('Helvetica-Bold')
       .fontSize(22)
       .text('STAYZEN // BOOKING_PASS', 40, 25, { characterSpacing: 2 });

    
    doc.fontSize(9)
       .text(`DTS_VERSION: 1.0.4 // LOG_ID: ${booking._id.toString().substring(0,12).toUpperCase()}`, 500, 32, { align: 'right', width: 260 });

    // 2. MAIN CONTENT AREA
    doc.fillColor(INK);

    // Title Section
    doc.fontSize(32).text(booking.listing.title.toUpperCase(), 40, 100);
    doc.fontSize(10).text(`LISTING_ID: ${booking.listing._id.toString().substring(0,8).toUpperCase()}`, 40, 140);

    // Data Segments (Improved Alignment)
    // Left Column
    doc.fontSize(9).font('Helvetica-Bold').text('LISTING LOCATION', 40, 175);
    doc.fontSize(14).text(booking.listing.location.toUpperCase(), 40, 190, { width: 300 });


    const lat = booking.listing.geometry?.coordinates[1]?.toFixed(4) || "0.0000";
    const lng = booking.listing.geometry?.coordinates[0]?.toFixed(4) || "0.0000";
    doc.fontSize(8).text(`COORD: [ ${lat} N , ${lng} E ]`, 40, 215);

    // Right Column (Fixed position to avoid overlap)
    doc.fontSize(9).text('GUEST DETAILS', 380, 175);
    doc.fontSize(14).text(booking.user.username.toUpperCase(), 380, 190, { width: 200 });
    doc.fontSize(8).text(`USER_UID: ${booking.user._id.toString().substring(0,8).toUpperCase()}`, 380, 215);


    // Middle Bar (Separator)
    doc.moveTo(40, 235).lineTo(580, 235).dash(4, { space: 4 }).stroke(INK);

    // Timeline
    doc.fontSize(9).text('CHECK-IN', 40, 255);
    doc.fontSize(18).text(booking.checkIn.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(), 40, 275);

    doc.fontSize(9).text('CHECK-OUT', 220, 255);
    doc.fontSize(18).text(booking.checkOut.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase(), 220, 275);


    const diffDays = Math.ceil(Math.abs(booking.checkOut - booking.checkIn) / (1000 * 60 * 60 * 24));
    doc.fontSize(9).text('DURATION', 400, 255);
    doc.fontSize(18).text(`${diffDays} DAYS`, 400, 275);

    // 3. FINANCIAL LEDGER (Bottom Section)
    doc.rect(0, 320, 600, 80).fill(INK);
    doc.fillColor(CREAM);
    
    const subtotal = booking.totalPrice / 1.18;
    const tax = booking.totalPrice - subtotal;
    
    doc.fontSize(9).text('PAYMENT_RECEIPT', 40, 340);

    doc.fontSize(11)
       .text(`SUB: INR ${subtotal.toLocaleString("en-IN")}`, 40, 360)
       .text(`TAX (18%): INR ${tax.toLocaleString("en-IN")}`, 200, 360);

    doc.fillColor(LIME).fontSize(18).text(`GRAND TOTAL: INR ${booking.totalPrice.toLocaleString("en-IN")}`, 40, 375);

    // 4. SIDEBAR STUB (Vertical Line)
    doc.moveTo(620, 70).lineTo(620, 400).dash(2, { space: 2 }).stroke(INK);
    doc.fillColor(INK);

    // "APPROVED" Geometric Stamp
    doc.circle(710, 330, 40).lineWidth(3).stroke();
    doc.fontSize(10).font('Helvetica-Bold').text('APPROVED', 685, 325);

    // Vertical Text Line 
    doc.fontSize(8).text('STAYZEN_BOOKING_VERIFIED_STATUS_CONFIRMED', 630, 280, { lineBreak: false });


    // QR Code
    doc.image(qrCodeBuffer, 640, 100, { width: 140, height: 140 });
    
    doc.fontSize(8).font('Helvetica-Bold').text('AUTH_KEY_SCAN', 640, 250, { width: 140, align: 'center' });

    // Mock Barcode effect at the bottom right
    for(let i=0; i<30; i++) {
       let w = Math.random() * 3 + 1;
       doc.rect(640 + (i*4), 300, w, 15).fill(INK);
    }

    doc.end();
};

module.exports.verifyPass = async (req, res) => {
    const { id } = req.params;
    try {
        const booking = await Booking.findById(id).populate("listing").populate("user");
        
        let status = "Invalid";
        if (booking) {
            status = "Verified";
        }

        res.render("users/verify.ejs", { booking, status });

    } catch (err) {
        // If ID is malformed or not found
        res.render("users/verify.ejs", { booking: null, status: "Access Denied" });
    }
};

