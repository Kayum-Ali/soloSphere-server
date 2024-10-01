const express = require('express');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();

// const corsOptions = {
//     origin: ['http://localhost:5173', 'http://localhost:5174'],
//     credentials: true,
//     optionsSuccessStatus: 200 
// }
app.use(cors());
app.use(express.json());

// mongodb connection

const { MongoClient, ServerApiVersion } = require('mongodb');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dangeag.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    
    const jobsCollection = await client.db('soloSphrere').collection('jobs');
    // const bidsCollection = await client.db('soloSphere').collection('bids');
    


    app.get('/jobs', async (req, res) => {
        const result = await jobsCollection.find().toArray();
        res.send(result);
    })
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
  }
}
run().catch(console.dir);



// Mock data
app.get('/', (req, res)=>{
    res.send('server in running')
})

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
})