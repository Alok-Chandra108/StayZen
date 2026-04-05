require('dotenv').config();
const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = process.env.MONGO_URI;

const User = require("../models/user.js");

main().then(() => {
    console.log("Connected to the DB")
}).catch((err) => {
    console.log(err)
})

async function main() {
    await mongoose.connect(MONGO_URL)
}

const initDB = async () => {
    await Listing.deleteMany({});
    
    // Fetch a real user to be the owner
    const user = await User.findOne({ username: "AlokChandra" });
    const ownerId = user ? user._id : "68751711b5751b714bf21d67";

    initData.data = initData.data.map((obj) => ({
        ...obj, 
        owner: ownerId,
        geometry: { type: "Point", coordinates: [0, 0] } // Default geometry to bypass validation
    }));
    
    await Listing.insertMany(initData.data);
    console.log("Data was initialized successfully with 30+ listings.");
}

initDB();