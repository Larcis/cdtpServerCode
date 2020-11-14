"use strict";

var mongoose = require("mongoose");
const constants = require("./constants");

module.exports = () => {
    mongoose.connect(constants.DB_CONNECTION_STRING, {useNewUrlParser: true, useUnifiedTopology: true});
    mongoose.connection.on('open', () => {
        console.log('MongoDB: Connected');
    });
    mongoose.connection.on('error', (err) => {
        console.log('MongoDB: Error', err);
    });
    mongoose.Promise = global.Promise;
}