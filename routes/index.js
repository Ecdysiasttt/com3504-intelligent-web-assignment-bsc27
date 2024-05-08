var express = require('express');
var router = express.Router();
var plants = require('../controllers/plants');

//TODO =============== THIS NEEDS DEFINING - THERE IS NO SUCH FILE =============== //
// var todoController = require('../controllers/todo');


router.get('/plants', function (req, res, next) {
  plants.getAll().then(plant => {
    console.log(plant);
    return res.status(200).send(plants);
  }).catch(err => {
    console.log(err);
    res.status(500).send(err);
  });
});

/* GET home page. */
router.get('/', function(req, res, next) {
  let result = plants.getAll();

  result.then(plants => {
    let data = JSON.parse(plants);
    console.log(data.length + " plants in database");
    res.render('index', {
      title: 'Home',
      site_name: 'Plantpedia',
      data: data
    });
  });
});

module.exports = router;

// route to get all todos

//TODO =============== COMMENTING THESE OUT UNTIL TODOCONTROLLER IS ADDED =============== //
// router.get('/todos', function (req, res, next) {
//     todoController.getAll().then(todos => {
//         console.log(todos);
//         return res.status(200).send(todos);
//     }).catch(err => {
//         console.log(err);
//         res.status(500).send(err);
//     });
// })
//
// // route to add a new todo
// router.post('/add-todo', function(req, res, next) {
//     console.log("Received a todo: " + req.body.text);
//     todoController.create(req.body).then(todo => {
//         console.log(todo);
//         res.status(200).send(todo);
//     }).catch(err => {
//         console.log(err);
//         res.status(500).send(err);
//     });
// });
