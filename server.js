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

Socket.io:
https://stackoverflow.com/questions/4647348/send-message-to-specific-client-with-socket-io-and-node-js
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
  let socketID = socket.id;
  console.log('New socket connection: ' + socketID);

  // for this socket, define event handlers:
  socket.on('newProfile', addProfile);

  function addProfile(data){
    console.log("Adding to DB:  " + data.name);
    profiles.push(data, finished);
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
    let isFound = false;
    console.log("Login Attempt by: " + loginName);
    for (let i=0; i<localProfiles.length;i++){
      if (localProfiles[i].name == loginName){
        console.log("\"" + loginName + "\" matches DB name \"" + localProfiles[i].name +"\"");
        let prof = {
          name:localProfiles[i].name,
          budget:localProfiles[i].budget,
          location:localProfiles[i].location
        }
        io.sockets.emit('login', prof);
        isFound = true;
        break;
      }
  	}
    console.log("No matches.")
    if (!isFound){
      io.sockets.emit('login', false);
    }
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
  let newProfileArray = [];
  let allProfiles = data.val();
  let myKeys = Object.keys(allProfiles);
  for (let i=0;i<myKeys.length;i++){
    let k=myKeys[i];
    let profile = {
      name: allProfiles[k].name,
      budget:allProfiles[k].budget,
      location:allProfiles[k].location
    }
    newProfileArray.push(profile); //add profiles to a new array
  }
  localProfiles = newProfileArray;
}

function gotErr(err){
  console.log(err);
}
