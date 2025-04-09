const mongoose = require("mongoose");
const { type } = require("os");
const { title } = require("process");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    description: String,
    image: {
        type: String,
        default: "https://www.pexels.com/photo/floor-plan-on-table-834892/",
        set: (v) => v === "" ? "https://www.pexels.com/photo/floor-plan-on-table-834892/" : v,
    },
    price: Number,
    location: String,
    country: String
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
