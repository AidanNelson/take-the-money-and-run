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
let server = app.listen(process.env.PORT || 3000); //set listening port
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
    // FIRST  , check that no other profiles exist w same name!!
    profiles.push(data, finished);
  }

  function finished(err){
    if (err){
      console.log("Error!");
      io.sockets.emit('newProfile', false);
    } else{
      console.log("New profile saved!");
      io.sockets.emit('newProfile', true);
    }
  }

  // event handler for a login attempt
  socket.on('login',checkLogin);

  function checkLogin(data){
    let isFound = false;

    console.log("Login attempt by: " + data);

    for (let i=0; i<localProfiles.length;i++){
      if (localProfiles[i].name == data){
        console.log("\"" + data + "\" matches DB name \"" + localProfiles[i].name +"\"");
        io.sockets.emit('login', localProfiles[i]); //send profile back to client / user
        isFound = true;
        break;
      }
    }
    if (!isFound){
      console.log("No matches in databse for: " + "\"" + data + "\"");
      io.sockets.emit('login', false); //send false back to client
    }
  }

  socket.on('update', updateLocations);

  function updateLocations(data){
    //update function here
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
  console.log(data.val());
  if (data.val()) { //ensure there is some before trying to make an array
    let newProfileArray = [];
    let dbProfiles = data.val();
    let myKeys = Object.keys(dbProfiles);
    for (let i=0;i<myKeys.length;i++){
      let k=myKeys[i];
      newProfileArray.push(dbProfiles[k]); //add profiles to a new array
    }
    localProfiles = newProfileArray;
  }
}

function gotErr(err){
  console.log(err);
}
