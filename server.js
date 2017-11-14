/*

serverProfiles
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

  function addProfile(clientData){
    let profileExists = false;

    console.log("checking if profile already exists");
    for (i=0; i<serverProfiles.length; i++){
      if (clientData.name == serverProfiles[i].profile.name){
        console.log("Profile already exists!");
        io.sockets.emit('newProfile', "Profile already exists!");
        profileExists = true;
      }
    }
    if (!profileExists){
      console.log("Adding to DB:  " + clientData.name);
      fbProfiles.push(clientData, finished);
    }
  }

  function finished(err){
    if (err){
      console.log("Error!");
      io.sockets.emit('newProfile', "Error!");
    } else{
      console.log("New profile saved!");
      io.sockets.emit('newProfile', "New Profile Saved!");
    }
  }

  // event handler for a login attempt
  socket.on('login',checkLogin);

  function checkLogin(data){
    let isFound = false;

    console.log("Login attempt by: " + data);

    for (let i=0; i<serverProfiles.length;i++){
      if (serverProfiles[i].profile.name == data){
        console.log("\"" + data + "\" matches DB name \"" + serverProfiles[i].profile.name +"\"");
        io.sockets.emit('login', serverProfiles[i].profile); //send profile back to client / user
        isFound = true;
        break;
      }
    }
    if (!isFound){
      console.log("No matches in databse for: " + "\"" + data + "\"");
      io.sockets.emit('login', false); //send false back to client
    }
  }

  socket.on('update', updateProfile);

  function updateProfile(clientProfile){
    //find key that matches name
    for (let i=0; i<serverProfiles.length; i++){
      if (serverProfiles[i].profile.name == clientProfile.name){
        //send client profile to server
        let profileReference = database.ref('profiles/' + serverProfiles[i].key);
        profileReference.set(clientProfile);
        break;
      }
    }
  }
}




// firebase:
let firebase = require("firebase");

//database variables
let database;
let fbProfiles;

let serverProfiles = [];

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
fbProfiles = database.ref('profiles');
fbProfiles.on('value', gotProfiles, gotErr);

function gotProfiles(fbData){
  console.log("Got profiles.");
  console.log(fbData.val());
  if (fbData.val()) { //ensure there is some before trying to make an array
    let newProfileArray = [];
    let dbProfiles = fbData.val();
    let myKeys = Object.keys(dbProfiles);
    for (let i=0;i<myKeys.length;i++){
      let k=myKeys[i];
      let newProf = {
        key: k,
        profile:dbProfiles[k]
      }
      newProfileArray.push(newProf); //add profiles to a new array
    }
    serverProfiles = newProfileArray;
  }
}

function gotErr(err){
  console.log(err);
}
