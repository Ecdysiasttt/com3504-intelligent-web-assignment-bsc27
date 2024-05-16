/**
 * Connects to MongoDB database
 */
let mongoose = require('mongoose');

// get the schema class from mongoose
let Schema = mongoose.Schema;


//TODO - Add date/time to each comment as well as necessary metadata?

/**
 * Defines the schema for the comment model
 * @param {int} chatId  unique id of the chat
 * @param {int}  userId   unique id of the user
 * @param {string}  text  contents of the chat
 */
let CommentSchema = new Schema(
    {

        // chatId           int
        // userId           int
        // text             string

        // define the fields with correct types
        chatId: {type: Number},
        userId: {type: Number},
        text: {type: String}

    }
);

// configure the 'toObject' option for the schema to include getters
// and virtuals when converting to an object
CommentSchema.set('toObject', { getters: true, virtuals: true});

// create the mongoose model 'plant' based on the defined schema
let Comment = mongoose.model('comment', CommentSchema);

module.exports = Comment;
