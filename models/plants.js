/**
 * Connects to MongoDB database
 */
let mongoose = require('mongoose');

// get the schema class from mongoose
let Schema = mongoose.Schema;

let CommentSchema = new Schema(

    {
        //userId        int
        //text          string

        userId: {type: String, required: true},
        text: {type: String, required: true}

    }

)

/**
 * Defines the schema for the plant model
 * @param {string} date  the date of viewing the plant
 * @param {string} time the time of viewing the plant
 * @param {int} height the height of the plant
 * @param {int} spread the spread of the plant
 * @param {bool} flowers whether the plant has flowers
 * @param {string} flower_colour what colour of flowers the plant has
 * @param {bool} leaves whether the plant has leaves
 * @param {bool} fruit whether the plant has fruits
 * @param {bool} seeds whether the plant has seeds
 * @param {string} sun sun exposure in the area
 * @param {string} name name of the plant
 * @param {string} identification identifiable names and status of the plant
 * @param {string} dbpedia information obtained from dbpedia
 * @param {buffer} photo photo of the plant taken
 * @param {string} uname user name of the recorder
 * @param {int} chatID ID of comment linked to viewing
 * @param {schema} comments contents of comments linked to viewing
 * @param {number} longitude longitude of the location of viewing
 * @param {number} latitude latitude of the location of viewing
 */
let PlantSchema = new Schema(
  {
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
    uname: {type: String, required: true, max: 100},
    chatId: {type: Number},
    comments: [CommentSchema],
    longitude: {type: Number, required: true},
    latitude: {type: Number, required: true}
  }
);

// configure the 'toObject' option for the schema to include getters
// and virtuals when converting to an object
PlantSchema.set('toObject', { getters: true, virtuals: true});

// create the mongoose model 'plant' based on the defined schema
let Plant = mongoose.model('plant', PlantSchema);

module.exports = Plant;
