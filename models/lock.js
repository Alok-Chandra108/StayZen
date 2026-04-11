const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingLockSchema = new Schema({
    listing: {
        type: Schema.Types.ObjectId,
        ref: "Listing",
        required: true
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    checkIn: {
        type: Date,
        required: true
    },
    checkOut: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 300 // 5 minutes TTL
    }
});

// Compound index for faster overlap checks
bookingLockSchema.index({ listing: 1, checkIn: 1, checkOut: 1 });

module.exports = mongoose.model("BookingLock", bookingLockSchema);
