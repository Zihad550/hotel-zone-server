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
    const usersCollection = database.collection("users");
    const photosCollection = database.collection("photos");
    const roomsCollection = database.collection("rooms");

    // hotels routes
    app.get("/hotels", async (req, res) => {
      const result = await hotelsCollections.find({}).toArray();
      res.json(result);
    });

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
      const query = { _id: ObjectId(id) };
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

    // cities routes
    // get all cities
    app.get("/cities", async (req, res) => {
      const result = await citiesCollection.find({}).toArray();
      res.send(result);
    });

    // add new city
    app.post("/cities", async (req, res) => {
      const city = req.body;
      const result = await citiesCollection.insertOne(city);
      res.json(result);
    });

    // delete city
    app.delete("/cities", async (req, res) => {
      const id = req.query.id;
      const query = { _id: ObjectId(id) };
      const result = await citiesCollection.deleteOne(query);
      res.json(result);
    });

    // user methods

    // get users
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find({}).toArray();
      res.send(result);
    });

    // post user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    });

    // update user
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.json(result);
    });

    // check if the user is admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });

    // update user to admin
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateDoc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    });

    // photos routes
    // get all photos
    app.get("/photos", async (req, res) => {
      const result = await photosCollection.find({}).toArray();
      res.send(result);
    });

    // add photos to the photo gallery
    app.post("/photos", async (req, res) => {
      const photo = req.body;
      const result = await photosCollection.insertOne(photo);
      res.json(result);
    });

    // delete selected photo
    app.delete("/photos", async (req, res) => {
      const result = await photosCollection.deleteOne({
        _id: ObjectId(req.query.id),
      });
      res.json(result);
    });

    // rooms routes
    // get all rooms
    app.get("/rooms", async (req, res) => {
      const result = await roomsCollection.find({}).toArray();
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
