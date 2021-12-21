const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const app = express();
const ObjectId = require("mongodb").ObjectId;

const port = process.env.PORT || 8000;

// middle ware
app.use(cors());
app.use(express.json());

// mongo client
const client = new MongoClient(process.env.URI);

async function run() {
  try {
    await client.connect();

    const database = client.db("greenHotels");
    const hotelsCollections = database.collection("hotels");
    const reviewsCollection = database.collection("reviews");
    const hotelBookedCollection = database.collection("hotelBooked");
    const citiesCollection = database.collection("cities");

    // set reviews
    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.json(result);
    });

    // get reviews
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find({}).toArray();
      res.send(result);
    });
    // get my reviews
    app.get("/reviews/review", async (req, res) => {
      const email = req.query.email;
      const query = { userEmail: email };
      const result = await reviewsCollection.find(query).toArray();
      res.json(result);
    });

    // delete reviews
    app.delete("/reviews", async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      const result = await reviewsCollection.deleteOne(query);
      res.json(result);
    });

    // post booked hotel
    app.post("/booked", async (req, res) => {
      const hotel = req.body;
      const result = await hotelBookedCollection.insertOne(hotel);
      res.json(result);
    });

    //delete bookings
    app.delete("/booked", async (req, res) => {
      const id = req.query.id;
      const query = { _id: Object(id) };
      const result = await hotelBookedCollection.deleteOne(query);
      res.json(result);
    });

    // get booked hotel using email
    app.get("/booked", async (req, res) => {
      const email = req.query.email;
      const query = { userEmail: email };
      const result = await hotelBookedCollection.find(query).toArray();
      res.send(result);
    });

    // cities
    app.get("/cities", async (req, res) => {
      const result = await citiesCollection.find({}).toArray();
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Welcome to green hotels server");
});

app.listen(port, () => {
  console.log("port running at localhost:", port);
});
