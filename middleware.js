const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()){
        //Redirect URL
        req.session.redirectUrl = req.originalUrl;
        req.flash("failure", "You must be login first");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl
    }
    next();
}

module.exports.isOwner = async(req, res, next) => {
     let {id} = req.params;
        let listing = await Listing.findById(id);
        if(!listing.owner._id.equals(res.locals.currUser._id)) {
            req.flash("failure", "You are not the Owner of this listing");
            return res.redirect(`/listings/${id}`);
        }
        next();
}

module.exports.validateListing = (req, res, next) => {
    if (!req.body.listing.amenities) req.body.listing.amenities = [];
    if (!req.body.listing.tags) req.body.listing.tags = [];


    let  {error} = listingSchema.validate(req.body);
    const safeRedirect = req.get("Referrer") || "/";
    
    if(error){
        const amenitiesError = error.details.find(e => e.context.key === "amenities");
        const tagsError = error.details.find(e => e.context.key === "tags");

        if (amenitiesError) {
            req.flash("failure", "Please select at least one amenity.");
            return res.redirect(safeRedirect);
        }

        if (tagsError) {
            req.flash("failure", "Please select at least one tag.");
            return res.redirect(safeRedirect);
        }

        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
        req.flash("failure", errMsg);  
    }else{
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errMsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

module.exports.isReviewAuthor = async(req, res, next) => {
    let { id, reviewId } = req.params;
       let review = await Review.findById(reviewId);
       if(!review.author.equals(res.locals.currUser._id)) {
           req.flash("failure", "You are not the Author of this review");
           return res.redirect(`/listings/${id}`);
       }
       next();
}