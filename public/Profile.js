class Profile{
  constructor(data, myKey){
    this.name = data.name;
    this.budget = data.budget;
    this.locations = data.locations;
    this.profilePicture = loadImage(data.profilePicture);
    this.currentProfileImageData = data.profilePicture;
  }

  forServer(){
    return {
      name: this.name,
      budget: this.budget,
      locations: this.locations,
      profilePicture: this.currentProfileImageData
    };
  }

  displayRoutes(){
    //iterate through all locations in current profile
    for (let i=0;i<this.locations.length;i++){

      let loc = this.locations[i];
      //check through all airports for matching IATA code
      for (let r = 0; r < airports.getRowCount(); r++) {
        let airport = airports.getString(r, 13); //IATA Code
        // console.log('checking ' + loc + ' against ' + airport);
        if (loc == airport){
          // console.log("Matching: " + loc + " / " + airport);
          let lat = airports.getString(r, 4);
          let lng = airports.getString(r, 5);

          let pos = myMap.latLngToPixel(lat, lng);
          fill(255);
          ellipse(pos.x, pos.y, 5, 5);
          break;
        }
      }
    }
  }
}
