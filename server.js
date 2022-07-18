const express = require('express');
const app = express();
const port = 3000;
const cors = require('cors');
const expressAsyncHandler = require('express-async-handler');
const path = require('path');
const V2Ttok = require('./v2_ttok');
const FDb = require('./v2_fdb');
const api = require('./v2_controllers');
const uuid = require('uuid').v4

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', expressAsyncHandler(async (req, res) => {
    if (req.query.name) {
        await V2Ttok.init(req.query.name);
        res.sendFile(__dirname + '/src/index.html');
    }else{
        res.send("<h1>Please provide your name</h1>");
    }
    
}));

app.get('/uuid', (req, res) => res.send(uuid()));

app.get('/test', (req, res) => {
    FDb.event('top10').refresh;
    res.send("halo");
})



app.use(api)

app.use(express.static('src'));

app.listen(port, () => console.log(`Example app listening on port ${port}!`));