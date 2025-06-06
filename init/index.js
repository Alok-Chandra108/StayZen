const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb+srv://alokchandra:alokchandra%4026@bloodwork.nhqcfbs.mongodb.net/StayZen?retryWrites=true&w=majority";

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
    initData.data = initData.data.map((obj) => ({...obj, owner: "6814dcc324345c9de42124f2"}))
    await Listing.insertMany(initData.data);
    console.log("Data was initialized");
}

initDB();