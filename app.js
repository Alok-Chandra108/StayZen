const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js")

const MONGO_URL = "mongodb://127.0.0.1:27017/StayZen"

main().then(() => {
    console.log("Connected to the DB")
}).catch((err) => {
    console.log(err)
})

async function main() {
    await mongoose.connect(MONGO_URL)
}


app.get("/", (req, res) => {
    res.send("HI Im GROOT")
})

app.get("/testListing", async (req, res) => {
    let sampleListing = new Listing ({
        title: "My Home",
        description: "By the highway route",
        price: 1200,
        location: "Mangalore, Goa",
        country: "India",
    })
    await sampleListing.save();
    console.log("Saved the response");
    res.send("Successful Test")
})

app.listen(8080, () => {
    console.log("Server is listening")
})
