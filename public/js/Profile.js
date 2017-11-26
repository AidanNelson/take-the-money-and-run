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

    let citySize = 20;
    fill(50,50,250); //blue

    //set first point for line
    let firstCity = this.locations[0];
    let firstPos = getPixelCoordinates(firstCity);
    ellipse(firstPos.x,firstPos.y,citySize,citySize);


    //go through all other locations, starting at the second location
    for (let i=1;i<this.locations.length;i++){

      firstPos = getPixelCoordinates(firstCity);

      let secondCity = this.locations[i];
      let secondPos = getPixelCoordinates(secondCity);

      stroke(0);
      strokeWeight(2);
      line(firstPos.x,firstPos.y,secondPos.x,secondPos.y);
      ellipse(firstPos.x,firstPos.y,citySize,citySize);

      //have last location blink
      if (i==this.locations.length-1){
        citySize = ((frameCount/2)%20) + 10; //blinking
        fill(220,250,30); //yellow
      };
      ellipse(secondPos.x,secondPos.y,citySize,citySize);

      firstCity = secondCity;
    }

    function getPixelCoordinates(cityName){
      //check through all airports for matching city name
      for (let r = 0; r < airports.getRowCount(); r++) {
        let toCheck = airports.getString(r, 10);
        if (cityName == toCheck){
          let lat = airports.getString(r, 4);
          let lng = airports.getString(r, 5);
          // console.log("lat: " + lat + " / lng: " + lng);

          return myMap.latLngToPixel(lat, lng);
          break;
        }
      }
    }
  }
}
