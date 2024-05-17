var express = require('express');
var router = express.Router();
var plants = require('../controllers/plants');
const path = require('path');
const fs = require('fs');


var todoController = require('../controllers/todo');


jsonEntry = {
    "copyright": "BC27",
    "date": "2023-02-09",
    "explanation": "Vivid and lustrous, wafting iridescent waves of color wash across this skyscape from Kilpisjärvi, Finland. Known as nacreous clouds or mother-of-pearl clouds, they are rare. But their unforgettable appearance was captured looking south at 69 degrees north latitude at sunset on January 24.  A type of polar stratospheric cloud, they form when unusually cold temperatures in the usually cloudless lower stratosphere form ice crystals. Still sunlit at altitudes of around 15 to 25 kilometers, the clouds can diffract sunlight even after sunset and just before the dawn.",
    "hdurl": "https://apod.nasa.gov/apod/image/2302/PearlCloudDennis7.jpg",
    "media_type": "image",
    "service_version": "v1",
    "title": "Plant sharing platform",
    "url": "https://apod.nasa.gov/apod/image/2302/PearlCloudDennis7_1024.jpg"
}


router.get('/plants', function (req, res, next) {
  plants.getAll().then(plants => {
    console.log(plants);
    return res.status(200).send(plants);
  }).catch(err => {
    console.log(err);
    res.status(500).send(err);
  });
});

router.get('/', function(req, res, next) {
    // Fetch plants from the /plants endpoint
    fetch('http://localhost:3000/plants')
        .then(function (response) {
            if (!response.ok) {
                throw new Error('Failed to fetch plants');
            }
            console.log('Got plants')
            return response.json();
        })
        .then(function (plants) {
            // Render the homepage with the fetched plant data
            res.render('index', {
                title: jsonEntry.title,
                site_name: 'Plantpedia',
                data: plants,
                path: jsonEntry.path
            });
        })
        .catch(function (error) {
            console.error('Error fetching plants:', error);
            res.status(500).send('Failed to fetch plants');
        });
});

/* GET home page. */


//Route for images to cache
router.get('/images/list', (req, res) => {
    const imagesDir = path.join(__dirname, '../','public', 'images', 'uploads');
    console.log(imagesDir);
    fs.readdir(imagesDir, (err, files) => {
      if (err) {
        return res.status(515).json({error: 'Failed to list images'});
      }

      const imageUrls = files.map(file => `../public/images/uploads/${file}`);
      res.json(imageUrls);
    });
});

// router.post('/login', function (req, res, next) {
//   // console.log("hjiklfhdsakjfhdslakjsdkfladfjkh");
//   let username = req.body.uname;
//   window.localStorage.setItem("username", username);
//   // res.render('index', { title: 'COM3504/3604', login_is_correct: false });
//   res.redirect('/');
// })


// route to add a new todo
router.post('/add-todo', function(req, res, next) {
    console.log("Received a todo: " + req.body.text);
    todoController.create(req.body).then(todo => {
        console.log(todo);
        res.status(200).send(todo);
    }).catch(err => {
        console.log(err);
        res.status(500).send(err);
    });
});


module.exports = router;
