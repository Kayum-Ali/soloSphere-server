const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

const corsOptions = {
    origin: ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions));
app.use(express.json());

// mongodb connection

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dangeag.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const jobsCollection = await client.db("soloSphrere").collection("jobs");
    const bidsCollection = await client.db("soloSphrere").collection("bids");

    // get all data from DB ---------
    app.get("/jobs", async (req, res) => {
      const result = await jobsCollection.find().toArray();
      res.send(result);
    });

    // get a single job data from DB ---------
    app.get("/job/:id", async (req, res) => {
      const result = await jobsCollection.findOne({
        _id: new ObjectId(req.params.id),
      });
      res.send(result);
    });

    // save a bid data in database
    app.post("/bid", async (req, res) => {
      const bidData = req.body;
      const result = await bidsCollection.insertOne(bidData);
      res.send(result);
    });
    // save a job data in database ------
    app.post("/job", async (req, res) => {
      const jobData = req.body;
      const result = await jobsCollection.insertOne(jobData);
      res.send(result);
    });

    // get all job posted by specific user
    app.get("/jobs/:email", async (req, res) => {
      const email = req.params.email;
      const query = {'buyer.email': email};
      const result = await jobsCollection.find(query).toArray();
      // console.log(result)
      res.send(result);
    });
    // single job delete
    app.delete("/job/:id", async (req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await jobsCollection.deleteOne(query)
      // console.log(result)
      res.send(result);
    });

    // update a job in DB
    app.put("/job/:id", async (req, res) => {
      const id = req.params.id;
      const updatedJob = req.body;
      const query = { _id: new ObjectId(id) };
      const options = {upsert: true}
      const updatedDoc = {
        $set: {...updatedJob},
      }
      const result = await jobsCollection.updateOne(query, updatedDoc,options);
      res.send(result);
    });



    // get all bids from a user by email from db
    app.get("/my-bids/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email};
      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    });


    app.get("/bid-request/:email", async (req, res) => {
      const email = req.params.email;
      const query = { 'buyer.email':email};
      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    });

    // update bid status
    app.patch("/update-status/:id", async(req, res) => {
      const id = req.params.id;
      const updatedStatus = req.body;
      const query = { _id: new ObjectId(id) };
      const updatedDoc = {
        $set: {...updatedStatus},
      }
      const result = await bidsCollection.updateOne(query, updatedDoc);
      res.send(result);
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
  }
}
run().catch(console.dir);

// Mock data
app.get("/", (req, res) => {
  res.send("server in running");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
