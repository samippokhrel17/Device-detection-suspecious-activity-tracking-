"use strict";

let express = require('express');
const bodyParser= require('body-parser');
const dotenv= require('dotenv')
const app = express();
const firstRoute= require('./routes/index')

const envPath=`${__dirname}/.env`
dotenv.config({path:envPath})


app.use(bodyParser.json())
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/api-v1',firstRoute)

const port= process.env.PORT || 3000;

app.listen(port,()=>{
    console.log(`listening to port ${port}`);
})