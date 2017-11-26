/*
Take the Money and Run: A Bot's Journey
by Simon & Aidan

ICM Final Project, Fall 2017
In this game, your player avatar will live out a wild and uninhibited life
of world travel, adventure and excitement while you stay at home,
go to work, and live out your decidedly more inhibited life.  Enjoy.

Sources:
Mappa: https://github.com/cvalenzuela/Mappa

TO DO:
would like to move drawRoutes into Profile, but have to figure out whether
mappa's latLngToPixel function works outside?

how to update dom P element?

returning isotocountry returns object rather than string??

getting length of json arranges in these ways

how to parse text
how to make a big change in code


*/
//socket to communicate w server
let socket;

// login screen:
let nameInput;
let budgetInput;
let locationInput;

//do we have a profiles
let currentProfile = null;

//table for airports
let airports;

//canvas
let canvas;
let webcam;
let mask;
let mapHeightScale = 0.7; //division line between controls and map (btwn 0 and 1)

//
let isLoggedIn = false;
let profilePic;

//create variables to hold the map, canvas, and "Mappa" instance
let myMap;
let mappa;


//text

let controlInput
let controlText = "Where to next?"
let loginResponse;
let gameResponse;
let helloText;

// let countryName;
// let countryInfo;
// let currency;

let pcLoc = {
  x: -100,
  y:-100
}

//div for all controls
let bottomBar;
let song;




////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function preload(){
  airports = loadTable("assets/airports_no_duplicates.txt","csv","header");
  mask = loadImage("assets/mask.png");

  //postcard info
  countryInfo = loadJSON(cInfo);
  isoToCountry = loadJSON(dkkToDenmark);
  currencyInWorld = loadJSON(countryCurrency);
  NationalDishJSON = loadJSON(urlNationalDish);
  LifeExpectancy = loadJSON(urlLifeExp);
  helloText = loadTable("assets/hello4.txt", "tsv");

  // song = loadSound("assets/song.mp3");
}


function setup(){
  // song.setVolume(0.1);
  // song.play();

  makeBottomBar();
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
  bottomBar.style('top',String(windowHeight*mapHeightScale).concat('px'));
  bottomBar.style('height',String(windowHeight*(1-mapHeightScale)).concat('px'));
  bottomBar.style('width',String(windowWidth).concat('px'));
}

function makeBottomBar(){
  bottomBar = createElement('div');
  bottomBar.id('bottomBar');
  //put at the bottom of the screen:
  bottomBar.style('top',String(windowHeight*mapHeightScale).concat('px'));
  bottomBar.style('height',String(windowHeight*(1-mapHeightScale)).concat('px'));
  bottomBar.style('width',String(windowWidth).concat('px'));
}

function makeLoginScreen(){
  canvas = createCanvas(640,480);
  canvas.id('canvas');
  webcam = createCapture(VIDEO);
  webcam.size(640, 480);
  webcam.hide();

  let loginScreen = createElement('div');
  loginScreen.id('loginScreen').parent('bottomBar');

  createP(loginInstructions).parent('loginScreen').class('gameControls');

  //picture taking stuff
  let snapButton = createButton("snap").parent('loginScreen').class('gameControls');
  snapButton.mousePressed(takeProfilePicture);
  let resetPictureButton = createButton("reset").parent('loginScreen').class('gameControls');
  resetPictureButton.mousePressed(resetProfilePicture);

  createElement('br').parent('loginScreen').class('gameControls');

  nameInput = createInput("name").parent('loginScreen').class('gameControls');
  budgetInput = createInput("budget").parent('loginScreen').class('gameControls');
  locationInput = createInput("location").parent('loginScreen').class('gameControls');
  locationInput.id("locationAutocomplete");
  //jQuery autocomplete for locations...
  $( "#locationAutocomplete" ).autocomplete({
    source: airports.getColumn('municipality')
  });
  let submitButton = createButton("submit new profile").parent('loginScreen').class('gameControls');
  submitButton.mousePressed(sendNewProfile);

  createElement('br').parent('loginScreen').class('gameControls');
  createElement('br').parent('loginScreen').class('gameControls');

  loginInput = createInput("login name").parent('loginScreen').class('gameControls');
  let loginButton = createButton("login").parent('loginScreen').class('gameControls');
  loginButton.mousePressed(sendLoginAttempt);

  loginResponse = createP("").parent('loginScreen').class('gameControls');
  loginResponse.id('loginResponse');



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
    document.getElementById('loginResponse').innerHTML = 'Great pic!';
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
    (function(){
      currentProfile.drawRoutes();
    })();

  } else{
    makePhotoBooth();
  }

  function makePhotoBooth(){
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
  //get rid of login screen div, webcam and map
  select('#loginScreen').remove();
  webcam.remove();
  select("#old-map-image").remove();



  resizeCanvas(windowWidth, windowHeight*mapHeightScale);


  //start the mappa on the latest location's coordinates
  let currentCity = currentProfile.locations[currentProfile.locations.length-1];
  let currentLoc = {
    lat:0,
    lng:0
  };
  for (var r = 0; r < airports.getRowCount(); r++) {
    if (airports.getString(r, 10) == currentCity){
      let lat = airports.getString(r, 4);
      let lng = airports.getString(r, 5);
      currentLoc.lat = lat;
      currentLoc.lng = lng;
    }
  }


  let options = { // options for mappa object
    //set starting coordinates to NYC
    lat: currentLoc.lat,
    lng: currentLoc.lng,
    //set zoom level
    zoom: 2,
    style: "http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
  }
  mappa = new Mappa('Leaflet');
  //call mappa object to create a tilemap at lat,long, zoom level
  myMap = mappa.tileMap(options);
  myMap.overlay(canvas); //create map overlay of a canvas
  // Associate redrawMap callback function with an "onChange" event of the map
  myMap.onChange(function(){
    currentProfile.drawRoutes();
  });

  (function(){
    currentProfile.drawRoutes();
  })();

  setTimeout(function(){
    isLoggedIn = true; //only log in once the map is ready
  },1000);

  // GAME CONTROLS
  let controlDiv = createElement('div');
  controlDiv.id('control').parent('bottomBar');

  let myP = createP(controlText);
  myP.parent('control').class('gameControls');

  controlInput = createInput("Beijing, etc.");
  controlInput.parent('control').class('gameControls');
  controlInput.id('controlInput');
  $( "#controlInput" ).autocomplete({
    source: airports.getColumn('municipality')
  });

  let goButton = createButton("Go!").parent('control').class('gameControls');
  goButton.mousePressed(addGoodAirports);

  // TEST FOR UPDATE FUNCTIONALITY
  // let saveButton = createButton("save").parent('control').class('gameControls');
  // saveButton.mousePressed(updateProfile);

  let postcardButton = createButton("postcard").parent('control').class('gameControls');
  postcardButton.mousePressed(makePostcard);
  let closePostcardButton = createButton("close postcard").parent('control').class('gameControls');
  closePostcardButton.mousePressed(closePostcard);

  gameResponse = createP("game response").parent('control').class('gameControls');
}

function addGoodAirports(){
  let toCheck = controlInput.value();
  console.log('looking for airport: ' + toCheck);
  for (var r = 0; r < airports.getRowCount(); r++) {
    if (airports.getString(r, 10) == toCheck){
      console.log('found airport');
      currentProfile.locations.push(toCheck);
      (function(){
        currentProfile.drawRoutes();
      })();
      updateProfile();
      break;
    }
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
    makeGame();
  } else {
    console.log("No match. Please try again.");
    document.getElementById('loginResponse').innerHTML = "no match found.";
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
