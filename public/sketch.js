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
let options = { // options for mappa object
  //set starting coordinates to NYC
  lat: 40.7128,
  lng: -73.950,
  //set zoom level
  zoom: 3,
  style: "http://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}.png"
}

//text

let controlInput
let controlText = "Where to next?"
let loginResponse;
let gameResponse;
let helloText;

// let countryName;
// let countryInfo;
// let currency;


//div for all controls
let bottomBar;





////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function preload(){
  airports = loadTable("assets/airports.txt","csv","header");
  mask = loadImage("assets/mask.png");
  countryInfo = loadJSON(cInfo);
  isoToCountry = loadJSON(dkkToDenmark);
  currencyInWorld = loadJSON(countryCurrency);
  helloText = loadTable("assets/hello4.txt", "tsv");
}


function setup(){
  canvas = createCanvas(640,480);
  canvas.id('canvas');
  webcam = createCapture(VIDEO);
  webcam.size(640, 480);
  webcam.hide();

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
  let submitButton = createButton("submit new profile").parent('loginScreen').class('gameControls');
  submitButton.mousePressed(sendNewProfile);

  createElement('br').parent('loginScreen').class('gameControls');
  createElement('br').parent('loginScreen').class('gameControls');

  loginInput = createInput("login name").parent('loginScreen').class('gameControls');
  let loginButton = createButton("login").parent('loginScreen').class('gameControls');
  loginButton.mousePressed(sendLoginAttempt);

  loginResponse = createP("login response").parent('loginScreen').class('gameControls');




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
  clear();
  if (isLoggedIn){
    drawRoutes();
  } else{
    makePhotoBooth();
  }
}

function makePhotoBooth(){
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

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function makeGame(){
  //get rid of login screen div, webcam and map
  select('#loginScreen').remove();
  webcam.remove();
  select("#old-map-image").remove();

  resizeCanvas(windowWidth, windowHeight*mapHeightScale);

  mappa = new Mappa('Leaflet');
  //call mappa object to create a tilemap at lat,long, zoom level
  myMap = mappa.tileMap(options);
  myMap.overlay(canvas); //create map overlay of a canvas
  // Associate redrawMap callback function with an "onChange" event of the map
  // myMap.onChange(drawRoutes);
  isLoggedIn = true; //only log in once the map is ready


  // GAME CONTROLS
  let controlDiv = createElement('div');
  controlDiv.id('control').parent('bottomBar');

  let myP = createP(controlText);
  myP.parent('control').class('gameControls');

  controlInput = createInput("JFK, LAX, LHR, etc!");
  controlInput.parent('control').class('gameControls');

  let goButton = createButton("Go!").parent('control').class('gameControls');
  goButton.mousePressed(addGoodAirports);

  // TEST FOR UPDATE FUNCTIONALITY
  let saveButton = createButton("save").parent('control').class('gameControls');
  saveButton.mousePressed(updateProfile);

  let postcardButton = createButton("postcard").parent('control').class('gameControls');
  postcardButton.mousePressed(makePostcard);
  let closePostcardButton = createButton("close postcard").parent('control').class('gameControls');
  closePostcardButton.mousePressed(closePostcard);

  gameResponse = createP("game response").parent('control').class('gameControls');

  //
}

function addGoodAirports(){
  let toCheck = controlInput.value();
  console.log('looking for airport: ' + toCheck);
  for (var r = 0; r < airports.getRowCount(); r++) {
    if (airports.getString(r, 13) == toCheck){
      console.log('found airport');
      currentProfile.locations.push(toCheck);
      break;
    }
  }
}


function makePostcard() {
  let iata = currentProfile.locations[currentProfile.locations.length-1];
  let iso;
  // console.log('Make postcard of ' + iata);


  for (var r = 0; r < airports.getRowCount(); r++) {
    if (airports.getString(r, 13) == iata){
      iso = airports.getString(r,8);
      console.log('found airport');
      let city = airports.getString(r,10);
      let searchList = ["beach" , "skyline" , "nightlife" , "monument" , "fashion" , "Bar" ];
      let searchWord = city + " " + searchList[floor(random(searchList.length))];
      console.log('your search is for: ' + " " + searchWord);
      let flickrAPI = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=43d46d0671093b54323ba9147cc4cc11&tags=" + searchWord + "&per_page=10&format=json&nojsoncallback=1";
      loadJSON(flickrAPI, displayRandomImage);
    }
  }

  function displayRandomImage(jsonData){
    let urls = [];
    for (var i = 0 ; i < 10 ; i++ ) {
      let server = jsonData.photos.photo[i].server;
      let secret = jsonData.photos.photo[i].secret;
      let id = jsonData.photos.photo[i].id;

      let newUrl  = "https://farm1.staticflickr.com/" + server + "/" + id + "_" + secret + "_b.jpg";
      urls.push(newUrl);
      console.log(newUrl);
    }
    console.log(urls);


    let pcDiv = createElement('div');
    pcDiv.id('postcard');
    let bgImg = createImg(urls[floor(random(urls.length))]).parent('postcard').class('postcard');
    let profImg = createImg(currentProfile.currentProfileImageData).parent('postcard').class('postcard');
    profImg.id("profileImage");


    let localHello = getLocalHello(iso);

    function getLocalHello(iso){
      let hello = "hello";
      for (let r=0;r<helloText.getRowCount();r++){
        // console.log('checking ' + helloText.getString(r,0) + " against " + iso);
        if (helloText.getString(r,0)==iso){
          hello  =  helloText.getString(r,2);
          console.log(hello);
        }
      }
      return hello;
    }
    console.log(localHello);

    let countryName = convertIsoToCountry(iso);
    let countryInfo = countryToInformation(countryName);
    let currency = countryToCurrency(countryName);

    let p1 = localHello + " from " + countryName + " \n If you don't know where it is it's " + countryInfo + "\nHope all is well \nI spend " + currency + " all the time!";
    let p2 = localHello + " from the land of " + countryName + "!  A pigeon alighted upon my finger this evening and tied to its foot was a small bundle of " + currency + "!  What a world is " + countryInfo + "! - " + currentProfile.name;
    let p3 = "Three words, and then silence.  A poet is only as good as the " + currency + " in his pocket.  Luckily, " + countryName + " has welcomed me with open arms and the " + countryInfo + " is a place to behold.  "+ localHello + " ever Yours, " + currentProfile.name;
    let p4 = localHello + " my friend! Through these many days of wandering, " + countryName + " has proved a gem. XOXO, "+ currentProfile.name;
    let p5 = localHello + " from an old fool!  In " + countryName + " I have found my greatest love.  I have forgone " + currency + " and am finally, unequicicably me: " + currentProfile.name;
    let postcardTemplates = [p1,p2,p3,p4,p5];
    console.log(localHello);
    let postcardText = createP(postcardTemplates[floor(random(postcardTemplates.length))]);

    console.log(postcardText);

    postcardText.parent('postcard').class('postcard');
  }
}

function closePostcard(){
  select('#postcard').remove();
}

function drawRoutes(){
  //set first point for line
  let firstAirport = currentProfile.locations[0];
  let firstPos = getPixelCoordinates(firstAirport);
  ellipse(firstPos.x,firstPos.y,10,10);

  for (let i=1;i<currentProfile.locations.length;i++){
    firstPos = getPixelCoordinates(firstAirport);

    let secondAirport = currentProfile.locations[i];
    let secondPos = getPixelCoordinates(secondAirport);

    stroke(0);
    strokeWeight(2);
    line(firstPos.x,firstPos.y,secondPos.x,secondPos.y);
    ellipse(firstPos.x,firstPos.y,10,10);
    ellipse(secondPos.x,secondPos.y,10,10);

    firstAirport = secondAirport;
  }

  // image(currentProfile.profilePicture,0,windowHeight*mapHeightScale-480,640,480);

  function getPixelCoordinates(IATA){
    //check through all airports for matching IATA code
    for (let r = 0; r < airports.getRowCount(); r++) {
      let airport = airports.getString(r, 13); //IATA Code
      if (IATA == airport){
        let lat = airports.getString(r, 4);
        let lng = airports.getString(r, 5);

        return myMap.latLngToPixel(lat, lng);
        break;
      }
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
    loginResponse.value("no match found.");
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
