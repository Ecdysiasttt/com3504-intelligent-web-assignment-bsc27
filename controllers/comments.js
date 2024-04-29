// import the plant model
const commentModel = require('../models/comments');

// function to create new plant
exports.create = function (chatId, userId, text) {
    // create a new comment instance using the provided user input, and the post it is attached to (chatId)
    let comment = new commentModel ({
        chatId: chatId,
        userId: userId,
        text: text
    });

    return comment.save().then(comment =>  {
        // log the created comment
        console.log(comment);

        // return the plant data as a JSON string
        return JSON.stringify(comment);
    }).catch(err => {
        // log error
        console.log(err);

        // return null
        return null;
    });

};

// Function to get all students
exports.getAll = function () {
    // Retrieve all students from the database
    return commentModel.find({}).then(comments => {
        // Return the list of students as a JSON string
        return JSON.stringify(comments);
    }).catch(err => {
        // Log the error if retrieval fails
        console.log(err);

        // Return null in case of an error
        return null;
    });
};

exports.formatDate = function(datetime) {
    const date = datetime.split("T")[0];

    // sort date from YYYY-MM-DD to DD/MM/YYYY
    const splitDate = date.split("-");
    var year = splitDate[0];
    var month = splitDate[1];
    var day = splitDate[2];

    return day + "/" + month + "/" + year;
}

exports.formatTime = function(datetime) {
    return datetime.split("T")[1];
}