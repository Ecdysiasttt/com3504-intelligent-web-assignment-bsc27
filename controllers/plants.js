// import the plant model
const plantModel = require('../models/plants');

// function to create new plant
exports.create = function (userData, filePath, date, time, chatId) {
  // create a new plant instance using the provided user data
  let plant = new plantModel ({
    date: date,
    time: time,
    height: userData.height,
    spread: userData.spread,
    flowers: userData.flowers,
    flower_colour: userData.flower_colour,
    leaves: userData.leaves,
    fruit: userData.fruit,
    seeds: userData.seeds,
    sun: userData.sun,
    name: userData.name,
    identification: userData.identification,
    dbpedia: userData.dbpedia,
    photo: filePath,
    uname: userData.uname,
    chatId: chatId,
  });

  return plant.save().then(plant =>  {
    // log the created plant
    console.log(plant);

    // return the plant data as a JSON string
    return JSON.stringify(plant);
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
  return plantModel.find({}).then(plants => {
    // Return the list of students as a JSON string
    return JSON.stringify(plants);
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