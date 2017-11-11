/*
server.js
Take the Money and Run

Server for game in three parts:
  1. node.js server using express framework serving public files
  2. socket.io to communicate with public profiles
  3. firebase to store and retreive information

links:
Dan Shiffman on Node / Express / Sockets / Firebase:
https://www.youtube.com/watch?v=i6eP1Lw4gZk
https://www.youtube.com/watch?v=JrHT1iqSrAQ

Firebase Documentation:
https://firebase.google.com/docs/web/setup
*/

// express
let express = require('express');
let app = express();
let server = app.listen(3000); //set listening port
app.use(express.static('public')); //serve up folder 'public'
console.log("Server is running.");



// sockets
let socket = require('socket.io');
let io = socket(server);

// sockets event handler for 'connection' event
io.sockets.on('connection', newConnection);

// what to do with a newly opened socket
function newConnection(socket) {
  console.log('New socket connection: ' + socket.id);

  // for this socket, define event handlers:
  socket.on('newProfile', addProfile);

  function addProfile(profile){
    console.log("Adding to DB:  " + profile.name);
    profiles.push(profile, finished);
  }

  function finished(err){
    if (err){
      console.log("Error!");
    } else{
      console.log("Data saved!")
    }
  }

  // event handler for a login attempt
  socket.on('login',checkLogin);

  function checkLogin(loginName){
    console.log("Login Attempt by: " + loginName);
    for (let i=0; i<localProfiles.length;i++){
      if (localProfiles[i].name == loginName){
        console.log("\"" + loginName + "\" matches DB name \"" + localProfiles[i].name +"\"");
        socket.broadcast.emit('loginResponse', true);
        break;
      }
  	}
    socket.broadcast.emit('loginResponse', false);
  }
}




// firebase:
let firebase = require("firebase");

//database variables
let database;
let profiles;

let localProfiles = [];

let config = {
	apiKey: "AIzaSyCNXWvMxraT7PTKKCLk4uzaQD-XNhzqw84",
	authDomain: "windemere-44.firebaseapp.com",
	databaseURL: "https://windemere-44.firebaseio.com",
	projectId: "windemere-44",
	storageBucket: "",
	messagingSenderId: "115375595951"
};

// Initialize Firebase
firebase.initializeApp(config);
database = firebase.database();
profiles = database.ref('profiles');
profiles.on('value', gotProfiles, gotErr);

function gotProfiles(data){
  console.log("Got profiles.");
  let allProfiles = data.val();
  let myKeys = Object.keys(allProfiles);
  for (let i=0;i<myKeys.length;i++){
    let k=myKeys[i];
    let profile = {
      name: allProfiles[k].name,
      budget:allProfiles[k].budget,
      location:allProfiles[k].location
    }
    localProfiles.push(profile);
  }
}

function gotErr(err){
  console.log(err);
}
