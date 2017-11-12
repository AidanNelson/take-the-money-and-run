/*
Take the Money and Run: A Bot's Journey
by Simon & Aidan

ICM Final Project, Fall 2017
In this game, your player avatar will live out a wild and uninhibited life
of world travel, adventure and excitement while you stay at home,
go to work, and live out your decidedly more inhibited life.  Enjoy.

Sources:
Mappa: https://github.com/cvalenzuela/Mappa

*/

let socket;

let nameInput;
let budgetInput;
let locationInput;
let submitButton;

let loginInput;
let loginButton;

let controlDiv

let currentProfile = null;

let airports;


//create variables to hold the map, canvas, and "Mappa" instance
let myMap;
let canvas;
let mappa;

// options for mappa object
let options = {
  //set starting coordinates to NYC
  lat: 40.7128,
  lng: -73.950,
  //set zoom level
  zoom: 3,
  style: "http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
}

function preload(){
  airports = loadTable("airports.txt","csv","header");
}


function setup(){
  makeMappa();
  makeLoginScreen();
  makeControls();
  // initialize socket connection to server
  // socket = io.connect('https://take-the-money-and-run.herokuapp.com/');
  socket = io.connect('http://localhost:3000');
  socket.on('login', gotLoginResponse);
}


function makeMappa(){
  //Mappa library requirements
  canvas = createCanvas(windowWidth, windowHeight-200);
  canvas.id('mapCanvas');
  mappa = new Mappa('Leaflet');
  //call mappa object to create a tilemap at lat,long, zoom level
  myMap = mappa.tileMap(options);
  myMap.overlay(canvas); //create map overlay of a canvas
  // Associate redrawMap callback function with an "onChange" event of the map
  myMap.onChange(drawRoute);
}

function makeControls(){
  controlDiv = createElement('div');
  controlDiv.id('control');

  let myP = createP('some control text');
  myP.parent('control');
  //put at the bottom of the screen:
  controlDiv.style('top',String(windowHeight-200).concat('px'));
  controlDiv.style('width',String(windowWidth).concat('px'));
}


function drawRoute(){
  clear();
  //check that we have a profile...
  if (currentProfile){
    //iterate through all locations in current profile
    for (let i=0;i<currentProfile.locations.length;i++){
      let loc = currentProfile.locations[i];
      //check through all airports for matching IATA code
      for (let r = 0; r < airports.getRowCount(); r++) {
        let airport = airports.getString(r, 13); //IATA Code
        // console.log('checking ' + loc + ' against ' + airport);
        if (loc == airport){
          console.log("Matching: " + loc + " / " + airport);
          let lat = airports.getString(r, 4);
          let lng = airports.getString(r, 5);

          let pos = myMap.latLngToPixel(lat, lng);
          fill(255);
          ellipse(pos.x, pos.y, 5, 5);
          break;
        } else{
          console.log('No match found.');
        }
      }
    }
  }
}




function makeLoginScreen(){
  let loginScreen = createElement('div');
  loginScreen.id('loginScreen');

  nameInput = createInput("name").parent('loginScreen').class('login');
  budgetInput = createInput("budget").parent('loginScreen').class('login');
  locationInput = createInput("location").parent('loginScreen').class('login');
  submitButton = createButton("submit new profile").parent('loginScreen').class('login');
  submitButton.mousePressed(sendNewProfile);

  createElement('br').parent('loginScreen').class('login');
  createElement('br').parent('loginScreen').class('login');

  loginInput = createInput("login name").parent('loginScreen').class('login');
  loginButton = createButton("login").parent('loginScreen').class('login');
  loginButton.mousePressed(sendLoginAttempt);
}








////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
// SOCKETS STUFF
function gotLoginResponse(data){
  if (data){
    console.log("Current User: " + data.name);
    console.log("Current User's locations: " + data.locations);
    //initialize the current profile object with data from database
    currentProfile = new Profile(data);
    //get rid of login box by hiding it
    select('#loginScreen').style("z-index", "-1");
  } else {
    console.log("No match. Please try again.");
    currentProfile = null;
  }
}

function sendLoginAttempt(){
  console.log("Attempting login by: " + loginInput.value());
  socket.emit('login',loginInput.value());
}


function sendNewProfile(){
  console.log("Sending new profile");
  let profile = {
    name: nameInput.value(),
    budget: budgetInput.value(),
    locations: [locationInput.value()]
  }
  socket.emit('newProfile',profile);
}

// function updateLocations(){
//   console.log("Updating user locations.");
//   socket.emit('update',locations);
// }
