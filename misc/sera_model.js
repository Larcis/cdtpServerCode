var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var sera_schema = new Schema({
    _id:  String,
    name: String,
    temperature: { type: [Number], default: [] },
    set_point: { type: [Number], default: [] },
    is_on: { type: Boolean, default: true }
});

module.exports = mongoose.model("sera", sera_schema);
