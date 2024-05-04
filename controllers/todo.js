// Import the todo model
const todoModel = require('../models/todo');

// create new todos
exports.create = function (userData) {
    console.log(userData)
    let todo = new todoModel({
        text: userData.text,
    });
    return todo.save().then(todo => {
        console.log(todo);
        return JSON.stringify(todo);
    }).catch(err => {
        console.log(err);
        return null;
    });
};

// get all todos
exports.getAll = function () {
    // Retrieve all todos from the database
    return todoModel.find({}).then(todos => {
        // Return the list of todos as a JSON string
        return JSON.stringify(todos);
    }).catch(err => {
        console.log(err);
        return null;
    });
};

