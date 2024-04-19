let mongoose = require('mongoose');

// get the schema class from mongoose
let Schema = mongoose.Schema;

// define the schema for the student model
let PlantSchema = new Schema(
  {
    // date             string
    // time             string
    // height           int
    // spread           int
    // flowers          bool
    // flower_colour     string
    // leaves           bool
    // fruit            bool
    // seeds            bool
    // sun              string
    // name             string
    // identification   string
    // dbpedia          string
    // photo            buffer
    // uname            string

    // define the fields with correct types
    date: {type: String, required: true, max: 100},
    time: {type: String, required: true, max: 100},
    height: {type: Number, required: true},
    spread: {type: Number, required: true},
    flowers: {type: Boolean},
    flower_colour: {type: String, max: 100},
    leaves: {type: Boolean},
    fruit: {type: Boolean},
    seeds: {type: Boolean},
    sun: {type: String, required: true, max: 100},
    name: {type: String, required: true, max: 100},
    identification: {type: String, required: true, max: 100},
    dbpedia: {type: String, required: true, max: 100},
    photo: {type: String, required: true },
    uname: {type: String, required: true, max: 100}
  }
);

// configure the 'toObject' option for the schema to include getters
// and virtuals when converting to an object
PlantSchema.set('toObject', { getters: true, virtuals: true});

// create the mongoose model 'plant' based on the defined schema
let Plant = mongoose.model('plant', PlantSchema);

module.exports = Plant;