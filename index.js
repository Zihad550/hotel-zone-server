const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
require("dotenv").config();
const app = express();
const ObjectId = require("mongodb").ObjectId;
const bcrypt = require("bcrypt");

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
    const blogsCollection = database.collection("blogs");

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
      res.json(result);
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
      const role = req.query.role;
      const query = { _id: ObjectId(id) };
      const result = await hotelBookedCollection.deleteOne(query);
      res.json(result);
    });

    // get booked hotel using email
    app.get("/booked", async (req, res) => {
      const email = req.query.email;
      const query = { userEmail: email };
      const result = await hotelBookedCollection.find(query).toArray();
      res.json(result);
    });

    // cities routes
    // get all cities
    app.get("/cities", async (req, res) => {
      const result = await citiesCollection.find({}).toArray();
      res.json(result);
    });

    // add new city
    app.post("/cities", async (req, res) => {
      const city = req.body;
      const result = await citiesCollection.insertOne(city);
      res.json(result);
    });

    // delete city
    app.delete("/city", async (req, res) => {
      const id = req.query.id;
      const result = await citiesCollection.deleteOne({
        $and: [
          {
            _id: ObjectId(req.query.id),
          },
          { deletable: true },
        ],
      });
      res.json(result);
    });

    // user routes && admin routes
    // register user
    app.post("/register", async (req, res) => {
      const { name, email, password } = req.body;
      // check if the users exists on the database
      const user = await usersCollection.findOne({ email });
      if (user) {
        res.json({ error: "User Exists" });
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = {
          name,
          email,
          password: hashedPassword,
        };
        const result = await usersCollection.insertOne(newUser);
        res.json({ ...result, ...newUser });
      }
    });

    // login user
    app.post("/login", async (req, res) => {
      const { email, password } = req.body;
      const user = await usersCollection.findOne({ email });
      if (user) {
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (isValidPassword) {
          res.json({ success: "Authentication successful", ...user });
        } else {
          res.json({ error: "Authentication failed" });
        }
      } else {
        res.json({ error: "Authentication failed" });
      }
    });

    // get user
    app.get("/user", async (req, res) => {
      const email = req.query.email;
      if (!email) res.json({ data: "email not provided" }).statusCode(400);
      const result = await usersCollection.findOne({ email });
      res.json(result);
    });

    // check if the user is admin
    app.get("/admin", async (req, res) => {
      const email = req.query.email;
      if (!email) res.json({ data: "email not provided" }).statusCode(400);
      const user = await usersCollection.findOne({ email });

      if (!user) res.json({ data: "user not provided" }).statusCode(400);

      if (user.role === "admin") {
        res.json({ admin: true });
      } else {
        res.json({ admin: false });
      }
    });

    // make user admin
    app.put("/admin", async (req, res) => {
      const email = req.query.email;
      const result = await usersCollection.updateOne(
        { email },
        { $set: { role: "admin" } },
      );
      res.json(result);
    });

    // photos routes
    // get all photos
    app.get("/photos", async (req, res) => {
      const result = await photosCollection.find({}).toArray();
      res.json(result);
    });

    // add photos to the photo gallery
    app.post("/photos", async (req, res) => {
      const photo = req.body;
      const result = await photosCollection.insertOne(photo);
      res.json(result);
    });

    // delete selected photo
    app.delete("/photo", async (req, res) => {
      const result = await photosCollection.deleteOne({
        $and: [
          {
            _id: ObjectId(req.query.id),
          },
          { deletable: true },
        ],
      });
      res.json(result);
    });

    // rooms routes
    // get all rooms
    app.get("/rooms", async (req, res) => {
      const result = await roomsCollection.find({}).toArray();
      res.json(result);
    });

    // blog routes
    // create blog
    app.post("/blog", async (req, res) => {
      const result = await blogsCollection.insertOne(req.body);
      res.json(result);
    });

    // get blogs
    app.get("/blogs", async (req, res) => {
      let { blogsPerPage, currentPage } = req.query;
      currentPage = JSON.stringify(currentPage - 1);
      console.log(currentPage);
      const total = await blogsCollection.countDocuments({});
      let result;

      if (currentPage) {
        result = await blogsCollection
          .find({})
          .skip(currentPage * blogsPerPage)
          .limit(parseInt(blogsPerPage))
          .toArray();
      } else {
        result = await blogsCollection.find({}).toArray();
      }

      res.json({ blogs: result, total });
    });

    // delete blog
    app.delete("/blog", async (req, res) => {
      const result = await blogsCollection.deleteOne({
        $and: [{ _id: ObjectId(req.query.id) }, { deletable: true }],
      });
      console.log(result);
      res.json(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/healtz", (req, res) => {
  res.send("Welcome to green hotels server");
});

app.listen(port, () => {
  console.log("port running at localhost:", port);
});
