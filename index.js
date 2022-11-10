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
            return res.send(services);
        })

        //api for add service 
        app.post('/add-service', async(req, res) => {
            try {
                const data = req.body;
                const info = await serviceCollection.insertOne(data);
                return res.status(200).json(info)
            } catch (error) {
                return res.status(500).json({message: error.message, error})
            }
        })

        //Review Api
        app.post('/reviews', async(req, res) => {
            const reviews = req.body;
            const result = await reviewCollection.insertOne(reviews);
            res.send(result);
        })


        //get all review by fixed service-id
        app.get('/review', async(req, res) =>{
            // console.log(req.query.email);
            let query = {};
            if(req.query.email){
                query={
                    email: req.query.email
                }
            }
            const review = await reviewCollection.find(query).toArray();
            res.send(review);
        })
        
        //api for delete review
        app.delete('/delete-review', async(req, res) =>{
            const cursor = await reviewCollection.deleteOne({_id: ObjectId(req.query.id)});
            console.log(cursor)
            res.send(cursor);
        })

        //api for update review
        app.put("/update-review", async(req, res) => {
            const {review} = req.body;
            const id = req.query.id;
            const updatedReview = await reviewCollection.updateOne({_id: ObjectId(id)}, {
                $set: {review: review}
            }) 

            res.send(updatedReview)
        })


        //get all review by fixed service-id
        app.get('/review', async(req, res) =>{
            // console.log(req.query.service);
            let query = {};
            if(req.query.service){
                query={
                    service: req.query.service
                }
            }
            const cursor = reviewCollection.find(query);
            const review = await cursor.toArray();
            res.send(review);
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