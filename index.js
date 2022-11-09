const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.port || 5000;

// middle wares
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER);
console.log(process.env.DB_PASSWORD);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.lbe4zil.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run(){
    try{
        const serviceCollection = client.db('serviceReviewer').collection('services');
        const reviewCollection = client.db('serviceReviewer').collection('reviews');
        
        //Api for checkout
        app.get('/services/:id', async(req, res)=>{
            const id = req.params.id;
            const query ={_id: ObjectId(id)};
            const service = await serviceCollection.findOne(query);
            res.send(service);
        })

        //Api for limited services
        app.get('/limited-services', async(req, res)=>{   
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.limit(3).toArray();
            // const count = await productCollection.estimatedDocumentCount();
            // res.send({count, products})
            res.send(services);
        })

        //Api for all services
        app.get('/services', async(req, res)=>{
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        //Review Api
        app.post('/reviews', async(req, res) => {
            const reviews = req.body;
            const result = await reviewCollection.insertOne(reviews);
            res.send(result);
        })

    }
    finally{

    }
};

run().catch(err => console.error(err));



app.get('/', (req, res)=>{
    res.send('Service review server is running');
});

app.listen(port, ()=>{
    console.log(`Service review server side is running on ${port}`);
});