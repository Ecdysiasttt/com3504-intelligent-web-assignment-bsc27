var express = require('express');
var router = express.Router();
var plants = require('../controllers/plants');


var todoController = require('../controllers/todo');


jsonEntry = {
    "copyright": "Dennis Lehtonen",
    "date": "2023-02-09",
    "explanation": "Vivid and lustrous, wafting iridescent waves of color wash across this skyscape from Kilpisjärvi, Finland. Known as nacreous clouds or mother-of-pearl clouds, they are rare. But their unforgettable appearance was captured looking south at 69 degrees north latitude at sunset on January 24.  A type of polar stratospheric cloud, they form when unusually cold temperatures in the usually cloudless lower stratosphere form ice crystals. Still sunlit at altitudes of around 15 to 25 kilometers, the clouds can diffract sunlight even after sunset and just before the dawn.",
    "hdurl": "https://apod.nasa.gov/apod/image/2302/PearlCloudDennis7.jpg",
    "media_type": "image",
    "service_version": "v1",
    "title": "Nacreous Clouds over Lapland",
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

/* GET home page. */
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




  /* Knoweldge Graph of plant from DBpedia */

//I think this is in the wrong place, and 'plant' is not a thing. This doesn't load. Moving the code to the plant route instead...

  // Create a new GET route for plant
// router.get('/' + plant.name, function (req, res, next) {
//
//   // Retrieve data from DBpedia resource
//   const resource = 'http://dbpedia.org/resource/' + plant.name;
//
//   // SPARQL query
//   const endpointUrl = 'https://dbpedia.org/sparql';
//   const sparqlQuery = `
//     PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
//     PREFIX dbo: <http://dbpedia.org/ontology/>
//
//     SELECT ?label ?plant
//     WHERE {
//       <${resource}> rdfs:label ?label .
//       <${resource}> dbo:plant ?plant .
//     FILTER (langMatches(lang(?label), "en")) .
//     }`;
//
//   const encodedQuery = encodeURIComponent(sparqlQuery);
//
//   const url = `${endpointUrl}?query=${encodedQuery}&format=json`;
//
//   // Retrieve data by fetch
//   fetch(url)
//       .then(response => response.json())
//       .then(data => {
//         let bindings = data.results.bindings;
//         let result = JSON.stringify(bindings);
//
//         // Render the result in plant.ejs
//         res.render('plant', {
//           title: bindings[0].label.value,
//           plant: bindings[0].plant.value,
//           JSONresult: result
//         });
//       });
// });


module.exports = router;
