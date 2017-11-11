/*
Take the Money and Run: A Bot's Journey
by Simon & Aidan

ICM Final Project, Fall 2017
In this game, your player avatar will live out a wild and uninhibited life
of world travel, adventure and excitement while you stay at home,
go to work, and live out your decidedly more inhibited life.  Enjoy.

Sources:
Mappa: https://github.com/cvalenzuela/Mappa
Seriously.js:
	https://github.com/brianchirls/Seriously.js/
	https://www.youtube.com/watch?v=jdKep6jo7b0


*/


let socket;
let submitButton;

let nameInput;
let budgetInput;
let locationInput;

let loginButton;

let currentProfile;

function setup(){
  socket = io.connect('http://localhost:3000');
  socket.on('loginResponse', gotLoginResponse);

  submitButton = createButton("Submit");
  submitButton.mousePressed(sendNewProfile);

  nameInput = createInput("name");
  budgetInput = createInput("budget");
  locationInput = createInput("location");

  createElement('br');
  createElement('br');
  createElement('br');

  loginInput = createInput("login name");
  loginButton = createButton("login");
  loginButton.mousePressed(sendLoginAttempt);
}

function gotLoginResponse(data){
  // let currentProfile = data;
  // if (currentProfile);
  console.log("got a response");
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
  console.log(profile);
  console.log("sending new profile");
  socket.emit('newProfile',profile);
}


function draw(){
}
