var express = require('express');
var router = express.Router();
var plants = require('../controllers/plants');

/* GET home page. */
router.get('/', function(req, res, next) {
  let result = plants.getAll();

  result.then(plants => {
    let data = JSON.parse(plants);
    console.log(data.length);
    res.render('index', { title: 'View all plants', data: data});
  });
});

module.exports = router;
