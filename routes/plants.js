var express = require('express');
var router = express.Router();
var plants = require('../controllers/plants');
var multer = require('multer');

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
router.post('/add', upload.single('photo'), function(req, res, next) {
  let userData = req.body;
  let filePath = req.file.path;
  console.log(userData.dateTime);
  let date = plants.formatDate(userData.dateTime.toString());
  let time = plants.formatTime(userData.dateTime.toString());

  // set checkboxes to boolean before storing in db
  userData.flowers = (userData.flowers === "on");
  userData.leaves = (userData.leaves === "on");
  userData.fruit = (userData.fruit === "on");
  userData.seeds = (userData.seeds === "on");

  // TODO - generate chatroom for plant comments - lab 03
  // (store chatroom id in plant db and grab chatroom for each plant when loaded?)
  let chatId = Math.floor(Math.random() * 900000 + 100000) //Random number

  let result = plants.create(userData, filePath, date, time, chatId);
  console.log(result);

  res.redirect('/');
});

module.exports = router;