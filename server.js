"use strict";
require('dotenv').config()

var cors = require('cors');
var express = require('express');
var app = express();
app.use(cors());

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use('/static', express.static(__dirname+ '/client'))

var http = require('http').createServer(app);
var io = require('socket.io')(http,{
    cors: {
      origin: '*',
    }
});
const constants = require("./misc/constants");
const db = require("./misc/db")()
var DB = require("./misc/sera_model");


app.get('/', function (request, response) {
    response.sendFile(__dirname + '/client/html/index.html');
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
        }
        if(body.name){
            sera.name = body.name;
        } else {
            sera.name = `${request.params.sera_id} serası`;
        }
        if(body.temperature || body.temperature === 0){
            if(sera.temperature.length == 30){
                sera.temperature = [];
            }
            sera.temperature.push(body.temperature);
        }
        if(body.set_point || body.set_point === 0){
            if(sera.set_point.length == 30){
                sera.set_point = [];
            }
            sera.set_point.push(body.set_point);
            io.emit("newSetPoint", {
                set_point: body.set_point,
                id: request.params.sera_id
            });
        }
        if(body.is_on === true || body.is_on === false){
            sera.is_on = body.is_on;
            io.emit("isOn", {
                is_on: body.is_on,
                id: request.params.sera_id
            });
        }
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
    socket.on('temperatureChanged', (data) => {
        io.emit('temperatureChanged', data);
    });
});

let port = process.env.PORT || constants.PORT;
http.listen(port, function () {
    console.log(`server basladi!... port: ${port}`);
});