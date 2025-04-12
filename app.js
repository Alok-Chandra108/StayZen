require('dotenv').config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const path = require("path");
const methodOverride = require("method-override")
const ejsMate = require("ejs-mate");
const port = process.env.PORT || 3000;


const uri = process.env.MONGO_URI;

mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});



main().then(() => {
    console.log("Connected to the DB")
}).catch((err) => {
    console.log(err)
})

async function main() {
    await mongoose.connect(MONGO_URL)
}

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")))

app.get("/", (req, res) => {
    res.send("HI Im GROOT")
})


//Index Route
app.get("/listings", async (req, res) => {
   const allListings = await Listing.find({});
   res.render("listings/index.ejs", {allListings})
    });

//New Route
app.get("/listings/new", (req, res) => {
    res.render("listings/new.ejs")
})


// Show Routes
app.get("/listings/:id", async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing })
});

//Create Route
app.post("/listings", async(req, res) => {
    const newListing = new Listing(req.body.listing);
    await newListing.save();
    res.redirect("/listings");
})

//Edit Route
app.get("/listings/:id/edit", async(req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit.ejs", {listing});
})

//Update Route
app.put("/listings/:id", async(req, res) => {
    let {id} = req.params;
    await Listing.findByIdAndUpdate(id, {...req.body.listing});
    res.redirect(`/listings/${id}`)
})

//Delete Route
app.delete("/listings/:id", async(req, res) => {
    let {id} = req.params;
    let deletedListing = await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
})

// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing ({
//         title: "My Home",
//         description: "By the highway route",
//         price: 1200,
//         location: "Mangalore, Goa",
//         country: "India",
//     })
//     await sampleListing.save();
//     console.log("Saved the response");
//     res.send("Successful Test")
// })

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
  