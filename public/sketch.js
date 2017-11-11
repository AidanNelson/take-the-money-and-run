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

let currentProfile;

function setup(){
  createElement('br');

  nameInput = createInput("name");
  budgetInput = createInput("budget");
  locationInput = createInput("location");
  submitButton = createButton("submit new profile");
  submitButton.mousePressed(sendNewProfile);

  createElement('br');

  loginInput = createInput("login name");
  loginButton = createButton("login");
  loginButton.mousePressed(sendLoginAttempt);

  //initialize socket connection to server
  socket = io.connect('http://localhost:3000');
  socket.on('login', gotLoginResponse);
}

function gotLoginResponse(data){
  if (data){
    console.log("Current User: " + data.name);
  } else {
    console.log("No match. Please try again.");
  }
}

function sendLoginAttempt(){
  console.log("Attempting login by: " + loginInput.value());
  socket.emit('login',loginInput.value());
}

function sendNewProfile(){
  let profile = {
    name: nameInput.value(),
    budget: budgetInput.value(),
    location: locationInput.value()
  }
  console.log("Sending new profile");
  socket.emit('newProfile',profile);
}


function draw(){
}
