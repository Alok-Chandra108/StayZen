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
        default: "https://cdn.pixabay.com/photo/2017/08/08/15/31/swedish-2611717_1280.jpg",
        set: (v) =>
            v === "" ? "https://cdn.pixabay.com/photo/2017/08/08/15/31/swedish-2611717_1280.jpg" : v,
    },
    price: Number,
    location: String,
    country: String
});


const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
