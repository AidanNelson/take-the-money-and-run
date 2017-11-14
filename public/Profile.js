class Profile{
  constructor(data, myKey){
    this.name = data.name;
    this.budget = data.budget;
    this.locations = data.locations;
  }

  displayRoutes(){
    for (let i=0; i<this.locations.length;i++){
      //get lat and long of locations
      //get pixel location of locations latlngtopixel
      //disply as an ellipse and a dashed 'great circle' line between locations
    }
  }
}
