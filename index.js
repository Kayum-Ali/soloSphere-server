const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
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
app.use(cookieParser())

// verify jwt middleware

const verifyToken = (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).send({ message: 'UnAuthoriza access' });

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) {
      return res.status(401).send({ message: 'Invalid token' });
    }
    req.user = decoded;
    next();
  });
};

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
    


    // jwt genarate
    app.post('/jwt', async (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.SECRET_KEY, {
        expiresIn: '365d',
      });
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
      }).send({success: true});
      console.log(token)
    })

    // clear cookie in logout
    app.get('/logout', (req, res) => {
      res.clearCookie('token',{
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        maxAge: 0,

      }).send({ success: true });
    });


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
    app.get("/jobs/:email", verifyToken, async (req, res) => {
      const tokenEmail = req.user.email;
      const email = req.params.email;
      if (tokenEmail !== email){
        return res.status(403).send({ message: 'forbidden  access' });
      }
     
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
    app.get("/my-bids/:email", verifyToken, async (req, res) => {
      const email = req.params.email;
      const query = { email};
      const result = await bidsCollection.find(query).toArray();
      res.send(result);
    });


    app.get("/bid-request/:email", verifyToken, async (req, res) => {
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
