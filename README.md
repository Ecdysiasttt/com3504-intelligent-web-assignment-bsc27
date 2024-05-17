# <h1 align="center">PLANTPEDIA</h1> 

## COM3504 Assignment 
### May 2024
<p><b>Team Bc27</p></b>

## Brief Description of the Project:
<p>Welcome to PLANTPEDIA! This is a progressive web application for plant recognition. </p>
<br>Developed as a COM3504 Project, we aim to provide a convenient tool for users to record the details of the plants they have seen in an organised way, and also to look up details of plants more easily.</br>
<p>We also want to build up a community for plant lovers by allowing convenient interactions between plant viewers by chats and comments.</p>


### Authors:
<p><b>Oliver Spacey</p></b>
<p><b>Harry Scutt</p></b>
<p><b>Wan Chi Leung</p></b>


## Table of Contents

- [Installation](#installation)
- [Functionality](#functionality)
- [Credits](#credits)


## Installation:

Node.js version `20.0.0` or above recommended.

### Load Project

```bash
git clone git@github.com:Ecdysiasttt/com3504-intelligent-web-assignment-bsc27.git
```

### Move to Project

```bash
cd com3504-intelligent-web-assignment-bsc2
```

### Install Packages

```bash
npm install
```

### Run Project

```bash
npm run serve
```

### Open Project

Enter the following address on your browser.

```bash
http://localhost:3000/
```

### Directory of Folders

- bins - entry point of the application
- controllers
- databases
- models
- node_modules
- public
- routes
- views

### Library and Packages

- Node.js v22.0.0
- socket.io v4.5.4
- Bootstrap v4.5.0
- Express.js

### Functionality:

- Set up an user account
- User login and logout
- Create plant details
- View all plant details
- Sort and categorise plants
- Comment on plants
- Online storage in MongoDB database
- Caching 
- Offline storage in IndexedDB database

## Design decisions:
- The user interface uses a simple layout and a white background so that the focus is on the photos of the plants.
- Users can select the locations of the plants on a map or use their geolocation to allow them add plant details after they leave the site.
- This web application uses MongoDB for online data storage for its flexibility in structured and unstructured data.
- This web application uses IndexedDB for offline data storage for its ability to store data persistently in the user's browser.

## Credits:
<p>Oliver Spacey - ohmspacey1@sheffield.ac.uk</p>
<p>Harry Scutt - hasscutt1@sheffield.ac.uk</p>
<p>Wan Chi Leung - wcleung1@sheffield.ac.uk</p>

