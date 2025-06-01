const Listing = require("../models/listing");
const axios = require("axios");

module.exports.index = async (req, res) => {
    const allListings = await Listing.find({});
    res.render("listings/index.ejs", {allListings})
}

module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs");
}

module.exports.showListing = async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id).populate({path: "reviews", populate: { path: "author"},}).populate("owner");
    if(!listing){
        req.flash("failure", "Requested listing does not exists");
        res.redirect("/listings")
    }
    res.render('listings/show', { listing });

}


module.exports.createListing = async (req, res, next) => {
    try {
        let url = req.file.path;
        let filename = req.file.filename;
        console.log("Received file:", req.file);

        const newListing = new Listing(req.body.listing);
        newListing.owner = req.user._id;
        newListing.image = { url, filename };

        // Geocoding: get location from user input
        const locationInput = `${req.body.listing.location}, ${req.body.listing.country}`;
        const encodedLocation = encodeURIComponent(locationInput);
        const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1`;

        const response = await axios.get(geoUrl, {
            headers: { 'User-Agent': 'Leaflet-Map-App' }
        });

        const geoData = response.data[0];
        if (!geoData) {
            req.flash("failure", "Invalid location provided.");
            return res.redirect("/listings/new");
        }

        // Add geometry data to listing
        newListing.geometry = {
            type: "Point",
            coordinates: [parseFloat(geoData.lon), parseFloat(geoData.lat)]
        };

        await newListing.save();
        req.flash("success", "New Listing Created");
        res.redirect("/listings");
    } catch (err) {
        next(err);
    }
};


module.exports.editListing = async (req, res) => {
    try {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("failure", "Requested listing does not exist");
            return res.redirect("/listings");
        }

        const originalImageUrl = listing.image.url.replace("/upload", "/upload/h_300,w_250");
        res.render("listings/edit.ejs", { listing, originalImageUrl });

    } catch (err) {
        req.flash("failure", "Something went wrong while fetching the listing.");
        res.redirect("/listings");
    }
};


module.exports.updateListing = async (req, res, next) => {
    try {
        let { id } = req.params;
        let listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { new: true });

        // Update image if a new file is uploaded
        if (typeof req.file !== "undefined") {
            let url = req.file.path;
            let filename = req.file.filename;
            listing.image = { url, filename };
        }

        // Update geolocation if location/country is changed
        const locationInput = `${req.body.listing.location}, ${req.body.listing.country}`;
        const encodedLocation = encodeURIComponent(locationInput);
        const geoUrl = `https://nominatim.openstreetmap.org/search?q=${encodedLocation}&format=json&limit=1`;

        const response = await axios.get(geoUrl, {
            headers: { 'User-Agent': 'Leaflet-Map-App' }
        });

        const geoData = response.data[0];
        if (!geoData) {
            req.flash("failure", "Invalid location provided.");
            return res.redirect(`/listings/${id}/edit`);
        }

        listing.geometry = {
            type: "Point",
            coordinates: [parseFloat(geoData.lon), parseFloat(geoData.lat)]
        };

        await listing.save();

        req.flash("success", "Listing Updated");
        res.redirect(`/listings/${id}`);
    } catch (err) {
        next(err);
    }
};

module.exports.destroyListing = async(req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
}