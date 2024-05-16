/**
 * This is the controller for all new plants created on the application.
 */

/**
 * import the plant model
 */
const plantModel = require('../models/plants');

/**
 * Creates a new plant.
 * @param date  the date of viewing the plant
 * @param time the time of viewing the plant
 * @param height the height of the plant
 * @param spread the spread of the plant
 * @param flowers whether the plant has flowers
 * @param flower_colour what colour of flowers the plant has
 * @param leaves whether the plant has leaves
 * @param fruit whether the plant has fruits
 * @param seeds whether the plant has seeds
 * @param sun sun exposure in the area
 * @param name name of the plant
 * @param identification identifiable names and status of the plant
 * @param dbpedia information obtained from dbpedia
 * @param photo photo of the plant taken
 * @param uname user name of the recorder
 * @param chatID ID of comment linked to viewing
 * @param comments contents of comments linked to viewing
 * @param longitude longitude of the location of viewing
 * @param latitude latitude of the location of viewing
 * @return the new plant data recorded as JSON string
 */
exports.create = function (userData, filePath, date, time, chatId, comments, longitude, latitude) {
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
    comments: comments,
    longitude: longitude,
    latitude: latitude
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

exports.getAll = function () {
  return plantModel.aggregate([
    {
      $project: {
        // Project all existing fields along with the original date and the formatted date for sorting
        _id: 1,
        date: 1, // Include the original date field
        dateSort: {
          $dateFromString: {
            dateString: { $concat: [ '$date', ' ', '$time' ] },
            format: "%d/%m/%Y %H:%M"
          }
        },
        time: 1,
        height: 1,
        spread: 1,
        flowers: 1,
        flower_colour: 1,
        leaves: 1,
        fruit: 1,
        seeds: 1,
        sun: 1,
        name: 1,
        identification: 1,
        dbpedia: 1,
        photo: 1,
        uname: 1,
        chatId: 1,
        comments: 1,
        longitude: 1,
        latitude: 1
      }
    },
    {
      $sort: { identification : -1, dateSort : -1 } // Sort plants
    }
  ]).then(plants => {
    // Return the list of plants as a JSON string
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
};

exports.formatTime = function(datetime) {
  return datetime.split("T")[1];
};


exports.remove = function(id){
  return plantModel.findOneAndDelete({_id: id});
}
