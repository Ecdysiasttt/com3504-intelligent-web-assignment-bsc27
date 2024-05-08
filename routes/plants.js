var express = require('express');
var router = express.Router();
var plants = require('../controllers/plants');
var multer = require('multer');
const Plant = require('../models/plants');

var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '../public/images/uploads/');
  },
  filename: function (req, file, cb) {
    var original = file.originalname;
    var file_extension = original.split(".");

    // make the file name the date + file extension
    filename = Date.now() + "." + file_extension[file_extension.length-1];
    cb(null, filename);
  }
});
let upload = multer( { storage: storage });

router.get('/add', function(req, res, next) {
  res.render('add', {
    title: 'Add new plant sighting',
    site_name: 'Plantpedia'
  });
});

//TODO - need logic for offline plant posts with iDB - labs 04/07


/* POST plant add form */
router.post('/add', upload.single('photo'), async function(req, res, next) {
  let userData = req.body;
  let filePath = req.file.path;
  console.log(userData.dateTime);
  let date = plants.formatDate(userData.dateTime.toString());
  let time = plants.formatTime(userData.dateTime.toString());
  let comments = null;
  let longitude = userData.longitude;
  let latitude = userData.latitude;
  let thisLocation = [longitude, latitude];

  // set checkboxes to boolean before storing in db
  userData.flowers = (userData.flowers === "on");
  userData.leaves = (userData.leaves === "on");
  userData.fruit = (userData.fruit === "on");
  userData.seeds = (userData.seeds === "on");

  //Generates a unique chatId for the comments. A chatId is generated, and then checked for validity until a unique ID is created.
  let chatId = Math.floor(Math.random() * 900000 + 100000) //Random number
  // let chatId = 1; //Testing function

  let valid = await checkIdValid(chatId);
  while (!valid){
    chatId = Math.floor(Math.random() * 900000 + 100000) //Random number
    valid = await checkIdValid(chatId);
  }


  let result = plants.create(userData, filePath, date, time, chatId, comments, longitude, latitude);
  console.log(result);

  res.redirect('/');
});

router.get('/:plantId', async function (req, res, next) {
  try {
    var plantId = req.params.plantId;

    // Wait for the promise to resolve
    var allPlants = await plants.getAll();

    var allPlantsJSON = JSON.parse(allPlants);

    var thisPlant = allPlantsJSON.find(plant => plant._id === plantId);

    res.render('plant', {
      plant: thisPlant
    });
  } catch (error) {
    // Handle any errors
    next(error);
  }
});


router.delete('/:plantId', async function (req, res, next) {
  const { plantId } = req.params;
  try {

    const deletedPlant = await plants.remove(plantId);

    res.json({ message: 'Plant removed successfully', deletedPlant });
  } catch (error) {

    next(error);
  }
});


router.post('/:plantId/comments', async function (req, res, next) {

  const plantId = req.params.plantId;
  const { text } = req.body;

  try {


    const plant = await Plant.findById(plantId);

    const newComment = {
      userId: 1,
      text: text
    };

    if(plant.comments == null){
      plant.comments = [newComment]; //Initialise comments if none exist.
    } else {
      plant.comments.push(newComment); //Add to existing array if comments exists.
    }

    await plant.save();

    console.log('Successfully added comment');
    console.log(plant.comments);


  } catch (error) {
    console.log('Failed to add comment:', error);
  }

});

async function checkIdValid (chatID) {
  var allPlants = await plants.getAll();
  var allPlantsJSON = JSON.parse(allPlants);

  if (allPlantsJSON.find(plant => plant.chatId === chatID)){
    console.log('ID already exists.')
    return false;
  }
  else{
    console.log('Unique ID.')
    return true;
  }
}


module.exports = router;