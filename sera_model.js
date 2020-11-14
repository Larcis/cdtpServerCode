var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var sera_schema = new Schema({
    _id:  String,
    name: String,
    temperature: Number,
    set_point: { type: Number, min: 0, max: 50 },
    is_on: Boolean
});

module.exports = mongoose.model("sera", sera_schema);
