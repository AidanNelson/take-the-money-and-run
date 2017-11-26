let cInfo = "https://raw.githubusercontent.com/mledoze/countries/master/countries.json";
let dkkToDenmark = "https://gist.githubusercontent.com/Goles/3196253/raw/9ca4e7e62ea5ad935bb3580dc0a07d9df033b451/CountryCodes.json"
let countryCurrency = "https://raw.githubusercontent.com/samayo/country-json/master/src/country-by-currency-name.json"

let urlNationalDish = "https://raw.githubusercontent.com/samayo/country-json/master/src/country-by-national-dish.json"
let NationalDishJSON;

let urlLifeExp = "https://raw.githubusercontent.com/samayo/country-json/master/src/country-by-life-expectancy.json"
let LifeExpectancy;


let countryInfo;
let countryName;
let isoToCountry;
let postcardImgUrl;


//converts ISO code into Country name
function convertIsoToCountry(iso) {
  //since JSON File consists of Objects you cant take length - convert it to array using keys function
  let keys = Object.keys(isoToCountry);
  for (let i = 0; i < keys.length; i++) {
    let code = isoToCountry[i].code;
    if (iso == code) {
      let country = isoToCountry[i].name;
      return(country);
    }
  }
}

//Add information from different countries
function countryToInformation(country) {
  for (let i = 0; i < 247; i++) {
    countryName = countryInfo[i].name.common;
    if (countryName == country) {
      let regionInfo = countryInfo[i].subregion;
      let officialName = countryInfo[i].name.official;
      let demonym = countryInfo[i].demonym;

      return {
        region: regionInfo,
        name: officialName,
        dem: demonym
      };
    }
  }
}

//add currency to country
function countryToCurrency(country) {
  for (let i = 0; i < 242; i++) {
    let currency = currencyInWorld[i].country;
    if (country == currency) {
      let currencyCountry = currencyInWorld[i].currency_name
      return(currencyCountry);
    }
  }
}

function countryNationalDish(country) {
  for (let i = 0; i < 200; i++) {
    let toCheck = NationalDishJSON[i].country;
    if (country == toCheck) {
      let nationalDish = NationalDishJSON[i].dish;
      return (nationalDish);
    }
  }
}

function countryLifeExpectancy(country) {
  for (let i = 0; i < 200; i++) {
    let toCheck = LifeExpectancy[i].country;
    if (country == toCheck) {
      let expAge = LifeExpectancy[i].expectancy;
      return expAge;
    }
  }
}

function getLocalHello(iso){
  let hello = "hello";
  for (let r=0;r<helloText.getRowCount();r++){
    if (helloText.getString(r,0)==iso){
      hello  =  helloText.getString(r,2);
      console.log(hello);
    }
  }
  return hello;
}

function searchFlickrAndMakePostcard(city, postcardText){
  // let searchList = ["skyline" , "city", "landscape", "urban", "", "", "", ""];
  // let searchWord = city + "," + searchList[floor(random(searchList.length))];
  let searchWord = city;
  console.log('your search is for: ' + " " + searchWord);
  let flickrAPI = "https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=43d46d0671093b54323ba9147cc4cc11&tags=" + searchWord + "&per_page=10&format=json&nojsoncallback=1&safe_search=1&content_type=1&media=photos&sort=relevance";
  loadJSON(flickrAPI,returnImageUrls);
  function returnImageUrls(jsonData){
    let urls = [];
    for (var i = 0 ; i < 10 ; i++ ) {
      let server = jsonData.photos.photo[i].server;
      let secret = jsonData.photos.photo[i].secret;
      let id = jsonData.photos.photo[i].id;
      let newUrl  = "https://farm1.staticflickr.com/" + server + "/" + id + "_" + secret + "_b.jpg";
      urls.push(newUrl);
    }
    // if (urls.length == 0){
    //   searchFlickrAndMakePostcard(city, postcardText);
    //   break;
    // }
    console.log(urls);

    postcardImgUrl = urls[floor(random(urls.length))];

    // html stuff
    let pcDiv = createElement('div');
    pcDiv.id('postcard');

    let bgImg = createImg(postcardImgUrl).parent('postcard').class('postcard');

    let profImg = createImg(currentProfile.currentProfileImageData).parent('postcard').class('postcard');
    profImg.id("profileImage");

    let postcardTextDiv = createElement('div');
    postcardTextDiv.id("postcardTextDiv").parent('postcard');
    let postcardTextP = createP(postcardText);
    postcardTextP.parent('postcardTextDiv');

    let closeButton = createButton("X").parent('postcard').class('postcardButton');
    closeButton.mousePressed(closePostcard);
  }
}



function makePostcardText(iso){
  let countryName = convertIsoToCountry(iso);
  let localHello = getLocalHello(iso);

  let countryInfo = countryToInformation(countryName);
  let currency = countryToCurrency(countryName);
  let nationalDish = countryNationalDish(countryName);
  let lifeLength = countryLifeExpectancy(countryName);

  // let p1 = localHello + " from " + countryName + " \n If you don't know where it is it's " + countryInfo + "\nHope all is well \nI spend " + currency + " all the time!";
  // let p2 = localHello + " from the land of " + countryName + "!  A pigeon alighted upon my finger this evening and tied to its foot was a small bundle of " + currency + "!  What a world is " + countryInfo + "! - " + currentProfile.name;
  // let p3 = "Three words, and then silence.  A poet is only as good as the " + currency + " in his pocket.  Luckily, " + countryName + " has welcomed me with open arms and the " + countryInfo + " is a place to behold.  "+ localHello + " ever Yours, " + currentProfile.name;
  // let p4 = localHello + " my friend! Through these many days of wandering, " + countryName + " has proved a gem. XOXO, "+ currentProfile.name;
  // let p5 = localHello + " from an old fool!  In " + countryName + " I have found my greatest love.  I have forgone " + currency + " and am finally, unequicicably me: " + currentProfile.name;

  let p6 = "hello: " + localHello + " / countryName: " + countryName + " / countryInfo: " + countryInfo.region + " / " +  countryInfo.name + " / " + countryInfo.dem + " / currency: " + currency + " / nationalDish: " + nationalDish + " / life length: " + lifeLength;

  // let postcardTemplates = [p1,p2,p3,p4,p5];
  // let postcardText = createP(postcardTemplates[floor(random(postcardTemplates.length))]);

  return p6;
}

function makePostcard() {
  closePostcard();
  let cityName = currentProfile.locations[currentProfile.locations.length-1];
  let iso = getIso(cityName);

  function getIso(city){
    for (let r = 0; r<airports.getRowCount();r++){
      if (city == airports.getString(r,10)){
        return airports.getString(r,8);
      }
    }
  }

  let postcardText = makePostcardText(iso);
  searchFlickrAndMakePostcard(cityName, postcardText);

  // setTimeout(function(){
  //   console.log("imgUrl: " + postcardImgUrl);
  //   // html stuff
  //   let pcDiv = createElement('div');
  //   pcDiv.id('postcard');
  //   let bgImg = createImg(postcardImgUrl).parent('postcard').class('postcard');
  //   let profImg = createImg(currentProfile.currentProfileImageData).parent('postcard').class('postcard');
  //   profImg.id("profileImage");
  //   let postcardTextP = createP(postcardText);
  //   postcardTextP.parent('postcard').class('postcard');
  // },2000);
}


function closePostcard(){
  let pc = select('#postcard');
  if (pc != null){ pc.remove();}
}
