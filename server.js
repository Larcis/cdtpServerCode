"use strict";
require('dotenv').config()
var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

var bodyParser = require('body-parser');
const constants = require("./constants");
const db = require("./db")()
var DB = require("./sera_model");


app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());


app.get('/', function (request, response) {
    response.sendFile(__dirname + '/index.html');
});


app.get('/api/all', function (request, response) {
    DB.find({}, function (err, seras) {
        response.send(seras);
    })
});

app.get('/api/sera/:sera_id', function (request, response) {
    DB.findById(request.params.sera_id).then((sera) => {
        //console.log(sera);
        if (sera) {
            response.json({
                sera,
                info: "Sera bilgisi getirildi."
            });
        } else {
            response.json({
                error: "Sera bulunamadı."
            });
        }
    }).catch((err) => {
        console.log(err);
        response.json({
            error: "Hatalı id"
        });
    });
});

app.put('/api/sera/:sera_id', function (request, response) {
    //create green house if not exist else update
    const body = request.body;
    //console.log(body);
    DB.findById(request.params.sera_id).then((sera) => {
        //console.log(sera);
        if (!sera) {
            sera = new DB();
            sera._id = request.params.sera_id;
            sera.name = `${request.params.sera_id} serası`;
        }
        if(body.temperature){
            if(sera.temperature.length == 30){
                sera.temperature = [];
            }
            sera.temperature.push(body.temperature);
        }
        if(body.set_point){
            if(sera.set_point.length == 30){
                sera.set_point = [];
            }
            sera.set_point.push(body.set_point);
            io.emit("new set point", {
                set_point: body.set_point,
                id: request.params.sera_id
            });
        }
        body.is_on && (sera.is_on = body.is_on);
        sera.save();
        response.json({
            sera,
            info: "Sera güncellendi."
        });
    }).catch((err) => {
        console.log(err);
        response.json({
            error: "Hatalı id"
        });
    });
});

app.delete('/api/sera/:sera_id', function (request, response) {
    DB.findByIdAndDelete(request.params.sera_id, function (err, docs) {
        if (err) {
            console.log(err)
            response.json({
                error: "Hata oldu."
            });
        } else {
            response.json({
                info: "Sera silindi."
            });
        }
    });

});

io.on('connection', (socket) => {
    //console.log('a user connected');
    socket.on('disconnect', () => {
        //console.log('user disconnected');
    });
    socket.on('temperature changed', (data) => {
        io.emit('temperature changed', data);
    });
});

let port = process.env.PORT || constants.PORT;
http.listen(port, function () {
    console.log(`server basladi!... port: ${port}`);
});