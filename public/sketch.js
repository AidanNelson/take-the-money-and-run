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
//socket to communicate w server
let socket;

//inputs
let nameInput;
let budgetInput;
let locationInput;


//html element
let controlDiv

//do we have a profiles
let currentProfile = null;

//table for airports
let airports;

//canvas
let canvas;
let webcam;
let mask;
let mapHeightScale = 0.8; //division line between controls and map

//
let profilePic;
let isLoggedIn = false;

//create variables to hold the map, canvas, and "Mappa" instance
let myMap;
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

//text
let controlText = "Where to next?"





////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function preload(){
  airports = loadTable("assets/airports.txt","csv","header");
  mask = loadImage("assets/mask.png");
}

function setup(){
  canvas = createCanvas(640,480);
  canvas.id('canvas');
  webcam = createCapture(VIDEO);
  webcam.size(640, 480);
  webcam.hide();

  makeLoginScreen();

  // initialize socket connection to server
  // socket = io.connect('https://take-the-money-and-run.herokuapp.com/');
  socket = io.connect('http://localhost:3000');
  socket.on('login', gotLoginResponse);
  socket.on('newProfile',newProfileResponse);
}

//update size of window if we are in game mode
function onWindowResize(){
  if (isLoggedIn){
    resizeCanvas(windowWidth, windowHeight*mapHeightScale);
  }
}

function makeLoginScreen(){
  let loginScreen = createElement('div');
  loginScreen.id('loginScreen');

  //picture taking stuff
  let snapButton = createButton("snap").parent('loginScreen').class('login');
  snapButton.mousePressed(takeProfilePicture);
  let resetPictureButton = createButton("reset").parent('loginScreen').class('login');
  resetPictureButton.mousePressed(resetProfilePicture);

  createElement('br').parent('loginScreen').class('login');

  nameInput = createInput("name").parent('loginScreen').class('login');
  budgetInput = createInput("budget").parent('loginScreen').class('login');
  locationInput = createInput("location").parent('loginScreen').class('login');
  let submitButton = createButton("submit new profile").parent('loginScreen').class('login');
  submitButton.mousePressed(sendNewProfile);

  createElement('br').parent('loginScreen').class('login');
  createElement('br').parent('loginScreen').class('login');

  loginInput = createInput("login name").parent('loginScreen').class('login');
  let loginButton = createButton("login").parent('loginScreen').class('login');
  loginButton.mousePressed(sendLoginAttempt);

  let updateButton = createButton("update").parent('loginScreen');
  updateButton.mousePressed(updateProfile);

  //take a profile picture and set the masked areas to zero alpha
  function takeProfilePicture() {
    profilePic = webcam.get();

    //get pixels for the new picture and the mask
    profilePic.loadPixels();
    mask.loadPixels();

    //remove white masked areas from profile pic by setting alpha to zero
    for (let x=0;x<width;x++){
      for (let y=0;y<height;y++){
        let pixelRef = (x + y*width)*4;
        let maskAlpha = mask.pixels[pixelRef + 3];
        if (maskAlpha != 0){
          profilePic.pixels[pixelRef + 3] = 0;
        }
      }
    }
    profilePic.updatePixels();
    console.log('Nice pic!');
    // save(profilePic,"myImg.png");
  }

  function resetProfilePicture() {
    profilePic = false;
    webcam = createCapture(VIDEO);
    webcam.size(640, 480);
    webcam.hide();
  }
}




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////


function draw(){
  if (isLoggedIn){
  } else{
    clear();
    if (profilePic) {
      image(profilePic, 0, 0,640,480);
    } else {
      push();
      //reverse webcam feed
      translate(width,0);
      scale(-1,1);
      image(webcam, 0, 0);
      pop();
      image(mask, 0, 0,);
    }
  }
}



////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function makeGame(){
  resizeCanvas(windowWidth, windowHeight*mapHeightScale);

  mappa = new Mappa('Leaflet');
  //call mappa object to create a tilemap at lat,long, zoom level
  myMap = mappa.tileMap(options);
  myMap.overlay(canvas); //create map overlay of a canvas
  // Associate redrawMap callback function with an "onChange" event of the map
  myMap.onChange(drawRoutes);

  // GAME CONTROLS
  controlDiv = createElement('div');
  controlDiv.id('control');

  let myP = createP(controlText);
  myP.parent('control');

  let controlInput = createInput("EWR, JFK, LAX, LHR, etc!");
  controlInput.parent('control');

  let controlButton = createButton("Go!").parent('control');
  controlButton.mousePressed(function(){
    currentProfile.locations.push(controlInput.value());
  });

  //put at the bottom of the screen:
  controlDiv.style('top',String(windowHeight*mapHeightScale).concat('px'));
  controlDiv.style('width',String(windowWidth).concat('px'));
}



function drawRoutes(){
  clear();
  //check that we have a profile...
  if (currentProfile){
    //iterate through all locations in current profile
    for (let i=0;i<currentProfile.locations.length;i++){
      let loc = currentProfile.locations[i];
      //check through all airports for matching IATA code
      for (let r = 0; r < airports.getRowCount(); r++) {
        let airport = airports.getString(r, 13); //IATA Code
        if (loc == airport){
          let lat = airports.getString(r, 4);
          let lng = airports.getString(r, 5);

          let pos = myMap.latLngToPixel(lat, lng);
          fill(255);
          ellipse(pos.x, pos.y, 5, 5);
          break;
        }
      }
    }
    image(currentProfile.profilePicture,0,windowHeight*mapHeightScale-480,640,480);
  }
}




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
////////////////////////////  SOCKETS STUFF  ///////////////////////////////////

// attempt to login to server
function sendLoginAttempt(){
  console.log("Attempting login by: " + loginInput.value());
  socket.emit('login',loginInput.value());
}
// response from server to login attempt
function gotLoginResponse(data){
  if (data){
    console.log("Current User: " + data.name);
    currentProfile = new Profile(data); //set currentProfile to incoming profile
    //get rid of login box by hiding it underneath everything else
    select('#loginScreen').style("z-index", "-1");

    //get rid of image canvas and make mappa canvas...
    isLoggedIn = true;
    webcam.remove();
    makeGame();
  } else {
    console.log("No match. Please try again.");
    currentProfile = false;
  }
}



// attempt to send a new profile to the server
function sendNewProfile(){
  console.log("Sending new profile");
  let profile = {
    name: nameInput.value(),
    budget: budgetInput.value(),
    locations: [locationInput.value()],
    profilePicture: p5.prototype.returnImageData(canvas, 'myCanvas', 'png')
  }
  socket.emit('newProfile',profile);
}

// new profile response function
function newProfileResponse(data){
  console.log(data);
}




//send update to server then to firebase
function updateProfile(){
  console.log("Updating current user profile.");
  socket.emit('update', currentProfile.forServer());
}
