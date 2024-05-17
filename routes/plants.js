var express = require('express');
var router = express.Router();
var plants = require('../controllers/plants');
var multer = require('multer');
const Plant = require('../models/plants');

//Saving image files to server:
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
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB
});


//Used for saving the images to server through a fetch
router.post('/upload', upload.single('photo'), function (req, res, next) {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  console.log('New file path:', req.file.path);
  res.status(200).json({ path: req.file.path });
});


//renders the add plants page
router.get('/add', function(req, res, next) {
  res.render('add', {
    title: 'Add new plant sighting',
    site_name: 'Plantpedia'
  });
});



/* POST plant add form */
//When plant add is requested (not through form as we use sync iDB, so this is done on the sync function call), then
//upload the photo to server, and collect all necessary data to add to mongoDB.
router.post('/add', upload.single('photo'), async function(req, res, next) {

  console.log('Attempting to add plant')
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


//When syncing, fetch this. This route decodes the base64 image and adds it to the server, and then creates a new plant.
router.post('/sync', async function(req, res, next) {
  try {
    console.log('Attempting to sync plant');
    const userData = req.body;
    console.log('Plant data: ', userData);

    if (!userData.photo) {
      return res.status(400).json({ message: 'No photo data provided' });
    }

    // Decode the base64 string
    const matches = userData.photo.match(/^data:(.+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return res.status(400).json({ message: 'Invalid input string' });
    }


    const imageType = matches[1];
    console.log('Image type:')
    console.log(imageType)
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    const blob = new Blob([buffer], { type: imageType });

    // Create a FormData object and append the image buffer
    const formData = new FormData();
    formData.append('photo', blob, {
      filename: `photo.${imageType.toString().split('/')[1]}`,
      contentType: imageType,
    });

    // Upload the photo file first
    const uploadResponse = await fetch('http://localhost:3000/plants/upload', { // Change URL as necessary
      method: 'POST',
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error('Error uploading image');
    }

    const uploadData = await uploadResponse.json();
    const photoPath = uploadData.path;

    console.log('File path:');
    console.log(photoPath);

    const date = userData.date;
    const time = userData.time;
    const comments = null;
    const longitude = userData.longitude;
    const latitude = userData.latitude;
    const thisLocation = [longitude, latitude];
    const chatId = userData.chatId;

    // Save plant data to the database
    let result = await plants.create(userData, photoPath, date, time, chatId, comments, longitude, latitude);

    console.log(result);
    res.status(200).json({ message: 'Plant synced successfully' });
  } catch (error) {
    console.error('Error syncing plant:', error);
    res.status(500).json({ message: 'Error syncing plant' });
  }
});


//This returns a valid chatID for the plant - each plant has a chatID for comments so socket.io knows where to look for the chats
//and this route guarantees that two plants cannot point to the same socket.io chatroom
router.get('/validId', async function (req, res, next) {
  let chatId = Math.floor(Math.random() * 900000 + 100000); // Random number

  // Check if the generated chat ID is valid
  let valid = await checkIdValid(chatId);
  while (!valid) {
    chatId = Math.floor(Math.random() * 900000 + 100000); // Generate a new random number
    valid = await checkIdValid(chatId);
  }

  // Send the valid chat ID as a JSON response
  res.json({ chatId: chatId });
});


//Gets the detailed view for the plant - only available online and offline for plants that have been synced - as this page must be cached during the sync event
router.get('/:plantId', async function (req, res, next) {


  try {
    console.log(req.params.plantId);
    var plantId = req.params.plantId;

    // Wait for the promise to resolve
    var allPlants = await plants.getAll();

    var allPlantsJSON = JSON.parse(allPlants);

    var thisPlant = allPlantsJSON.find(plant => plant._id === plantId);
    console.log(thisPlant.name);

    // Retrieve data from DBpedia resource
    // const resource = 'http://dbpedia.org/resource/Tulip' + thisPlant.name;

    const resource = 'http://dbpedia.org/resource/Tulip';
// <!--    PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>-->
// <!--    PREFIX dbo: <http://dbpedia.org/ontology/>-->

    // SPARQL query
    const endpointUrl = 'https://dbpedia.org/sparql';
    const sparqlQuery = `
    SELECT DISTINCT ?plant ?comment ?species ?genus ?taxon
    WHERE {
      {
        ?plant a dbo:Plant ;
               rdfs:label "${thisPlant.name}"@en ;
               rdfs:comment ?comment .
        FILTER (LANG(?comment) = 'en') 
        OPTIONAL { ?plant dbp:species ?species }
        OPTIONAL { ?plant dbp:genus ?genus }
        OPTIONAL { ?plant dbp:taxon ?taxon }
      }
      UNION
      {
        ?redirect dbo:wikiPageRedirects ?plant ;
                  rdfs:label "${thisPlant.name}"@en .
        ?plant a dbo:Plant ;
               rdfs:comment ?comment .
        FILTER (LANG(?comment) = 'en')
        OPTIONAL { ?plant dbp:species ?species }
        OPTIONAL { ?plant dbp:genus ?genus }
        OPTIONAL { ?plant dbp:taxon ?taxon }
      }
    }`;
    // TODO make search case-insensitive if possible?

    // want to get:
    // - common/scientific name
    // - plant description
    // - URI (Links to dbpedia page)

    const encodedQuery = encodeURIComponent(sparqlQuery);

    console.log('sparqlQuery: ' + sparqlQuery);

    const url = `${endpointUrl}?query=${encodedQuery}&format=json`;

    console.log("Url: " + url);

    // Retrieve data by fetch
    fetch(url)
        .then(response => response.json())
        .then(data => {
          console.log(data.results.bindings.length === 0);
          let plantInfo = data.results.bindings;
          let uri = null;
          let comment = null;
          let species = null;
          let genus = null;
          let taxon = null;

          let found = false;

          if (plantInfo.length !== 0) {
            found = true;

            console.log(plantInfo);
            console.log("Data found from DBPedia");
            uri = plantInfo[0].plant.value;
            comment = plantInfo[0].comment.value;
            species = plantInfo[0].species ? plantInfo[0].species.value : null;
            genus = plantInfo[0].genus ? plantInfo[0].genus.value : null;
            taxon = plantInfo[0].taxon ? plantInfo[0].taxon.value : null;

            console.log("URI = " + uri);
            console.log("comment = " + comment);
            console.log("species = " + species);
            console.log("genus = " + genus);
            console.log("taxon = " + taxon);
          }

          // Render the result in plant.ejs
          res.render('plant', {
            // title: bindings[0].label.value,
            // plantDB: bindings[0].plant.value,
            plant: thisPlant,
            uri: uri,
            comment: comment,
            species: species,
            genus: genus,
            taxonomy: taxon,
            found: found
          });
        });

    // res.render('plant', {
    //   plant: thisPlant
    // });
  } catch (error) {
    // Handle any errors
    next(error);
  }
});


//This was my attempt at getting an offline only, uncached router to handle detailed view for newly created plants
//Could not get it to work, however.
router.get('/offline', async function (req, res, next) {
  const plantID = req.query.plantId;


  try {
    // Open IndexedDB connection
    const db = await openSyncPlantsIDB();

    const plants = await getAllSyncPlants(db);

    //check each for the correct id, store the plant with correct id.
    const thisPlant = plants.find(plant => plant.id === plantID);

    if (thisPlant) {
      res.render('plant', { plant: thisPlant });
    } else {
      // If the plant with the given ID is not found, return a 404 error
      res.status(404).send('Plant not found');
    }

  } catch (error) {
    // Handle errors, such as if the plant ID doesn't exist in the IDB
    console.error('Error fetching plant data:', error);
    res.status(500).send('Error fetching plant data');
  }
});




router.delete('/:plantId', async function (req, res, next) {
  const { plantId } = req.params;

  console.log('Trying to delete plant:', plantId);

  try {

    const deletedPlant = await plants.remove(plantId);

    res.json({ message: 'Plant removed successfully', deletedPlant });
    console.log('Plant removed successfully');
  } catch (error) {

    next(error);
  }
});


router.post('/:plantId/comments', async function (req, res, next) {

  const plantId = req.params.plantId;
  const { text, user } = req.body;

  console.log(text);
  console.log(user);

  try {


    const plant = await Plant.findById(plantId);

    const newComment = {
      userId: user,
      text: text
    };

    // if(plant.comments == null){
    //   plant.comments = [newComment]; //Initialise comments if none exist.
    // } else {
    //   plant.comments.push(newComment); //Add to existing array if comments exists.
    // }

    try {
      plant.comments.push(newComment);
    } catch {
      plant.comments = [newComment];
    }

    console.log('Saving...')
    await plant.save();

    console.log('Successfully added comment');
    console.log(plant.comments);


  } catch (error) {
    console.log('Failed to add comment:', error);
  }

});




router.get('/:plantId/comments', async function(req, res, next) {
  try {
    const id = req.params.plantId;
    const plant = await Plant.findById(id);
    const plantComments = plant.comments;
    const plantChatId = plant.chatId;

    console.log(plantComments);

    res.json({ success: true, comments: plantComments , chatId: plantChatId});
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch comments', error: error.message });
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

// Route to get all plant IDs
router.get('/api/plants/ids', async (req, res) => {
  try {
    const plants = await Plant.find({}, '_id'); // Fetch only the _id field
    const plantIds = plants.map(plant => plant._id);
    console.log('HEREAWRKASFLJASOIFNAS;OFMAOSFNAOSFMASLKFN')
    res.json(plantIds);
  } catch (error) {
    res.status(500).send('Error fetching plant IDs');
  }
});


module.exports = router;