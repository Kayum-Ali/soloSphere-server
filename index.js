const express = require('express');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;
const app = express();

app.use(cors());
app.use(express.json());


// Mock data
app.get('/', async(req, res)=>{
    console.log('SoloSphere server is running')
})

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`)
 ;
})