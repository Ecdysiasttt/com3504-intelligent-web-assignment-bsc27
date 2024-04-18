const mongoose = require('mongoose');

// define the MongoDB connection URL, including
// the database name ('plants' in this case)
const mongoDB = 'mongodb://localhost:27017/plants';
let connection;

// set mongoose to use the global Promise library
mongoose.Promise = global.Promise;

// connect to the mongodb server
mongoose.connect(mongoDB).then(result => {
    // store the connection instance for later use if needed
    connection = result.connection;
    // log a success message if the connection is established
    console.log("Database connection successful!");
}).catch(err => {
    // log an error message if the connection fails
    console.log("Connection failed...", err);
})
