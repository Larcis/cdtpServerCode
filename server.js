"use strict";

var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var bodyParser = require('body-parser');
const constants = require("./constants");
/*const db = require("./db")()
var DB = require("./sera_model");*/


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.get('/api/temperature/:sera_id', function (request, response) {
    /*DB.findById(request.params.sera_id).then((sera) => {
        res.json(sera.temperature);
    }).catch((err) => {
        res.json("Hatalı id");
    });*/
    response.send(`you send sera_id: ${request.params.sera_id}`);
});

app.put('/api/temperature/:sera_id', function (request, response) {
    //create green house if not exist else update
    console.log(request.body);
    response.send(`you send sera_id: ${request.params.sera_id}`);
});

app.put('/api/ghstate/:sera_id', function (request, response) {
    //create green house if not exist else update
    console.log(request.body);
    response.send(`you send sera_id: ${request.params.sera_id}`);
});

io.on('connection', (socket) => {
    console.log('a user connected');
});

http.listen(constants.PORT, function () {
    console.log(`server basladi!... port: ${constants.PORT}`);
});