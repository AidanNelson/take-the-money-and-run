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

  drawRoutes(){
    clear(); //clear canvas overlay

    //set first point for line
    let firstCity = this.locations[0];
    let firstPos = getPixelCoordinates(firstCity);
    ellipse(firstPos.x,firstPos.y,10,10);

    //go through all other locations, starting at the second location
    for (let i=1;i<this.locations.length;i++){
      firstPos = getPixelCoordinates(firstCity);

      let secondCity = currentProfile.locations[i];
      let secondPos = getPixelCoordinates(secondCity);

      stroke(0);
      strokeWeight(2);
      line(firstPos.x,firstPos.y,secondPos.x,secondPos.y);
      ellipse(firstPos.x,firstPos.y,10,10);
      ellipse(secondPos.x,secondPos.y,10,10);

      firstCity = secondCity;
    }

    function getPixelCoordinates(cityName){
      //check through all airports for matching city name
      for (let r = 0; r < airports.getRowCount(); r++) {
        let toCheck = airports.getString(r, 10);
        if (cityName == toCheck){
          let lat = airports.getString(r, 4);
          let lng = airports.getString(r, 5);

          return myMap.latLngToPixel(lat, lng);
          break;
        }
      }
    }
  }

}
