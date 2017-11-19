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
}
