const express = require('express');
const {MongoClient} = require('mongodb');
const path = require('path');
const app = express();
const bodyParser = require('body-parser');
const {check} = require('express-validator');

require('dotenv').config();

const PORT = process.env.PORT || 3001;
// connection string
const URI = process.env.DATABASE_CONNECTION;
const client = new MongoClient(URI);

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(express.static(path.resolve(__dirname, 'public')));

async function run() {
    try {
        console.log("Connected successfully to server...");

        app.post("/post-feedback", [
            check('Name').trim().escape().stripLow(),
            check('Email').trim().escape(),
            check('Feedback').trim().escape().stripLow()
        ], async (req,res)=>{
            client.connect().then(function(){
                console.log("Connected successfully to database!");
                delete req.body._id; //deletes id so data cannot be deleted in DB
                let message = {
                    "Name": req.body.Name,
                    "Email": req.body.Email,
                    "Feedback": req.body.Feedback
                }
                client.db("FeedbackDB").collection("Feedback").insertOne(message);
                console.log("Data successfully sent to database!");
            });
            //redirect to main page
            res.redirect("https://www.alexmonteverde.com");
        })

        app.listen(PORT, ()=> {
            console.log(`Server listening on ${PORT}...`);
        })

    } finally {
        // ensures that the client will close when finished/error.
        await client.close();
    }
}
run().catch(console.dir);