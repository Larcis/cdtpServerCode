var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var sera_schema = new Schema({
    _id:  String,
    name: String,
    temperature: { type: Number, default: 0 },
    set_point: { type: Number, default: 25 },
    is_on: { type: Boolean, default: true }
});

module.exports = mongoose.model("sera", sera_schema);
