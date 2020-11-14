"use strict";

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
        if(body.temperature && sera.temperature.length == 30){
            sera.temperature = []
        }
        if(body.set_point && sera.set_point.length ==  30){
            sera.set_point = [];
        }
        body.temperature && (sera.temperature.push(body.temperature));
        body.set_point && (sera.set_point.push(body.set_point));
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
    console.log('a user connected');
});

http.listen(constants.PORT, function () {
    console.log(`server basladi!... port: ${constants.PORT}`);
});