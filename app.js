const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")
const path = require("path");


const MONGO_URL = "mongodb://127.0.0.1:27017/StayZen"

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
app.use(express.urlencoded)

app.get("/", (req, res) => {
    res.send("HI Im GROOT")
})


//Index Route
app.get("/listings", async (req, res) => {
   const allListings = await Listing.find({});
   res.render("listings/index.ejs", {allListings})
    });


// Show Routes
app.get("/listings/:id", async (req, res) => {
    let {id} = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/show.ejs", { listing })
});

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

app.listen(8080, () => {
    console.log("Server is listening")
})
