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
  let countryName = "This country";
  let localHello = "Hi";
  let countryInfo = {
    region: "around here",
    name: "This country",
    dem: "the local people"
  };
  let currency = "capital";
  let nationalDish = "the national dish";
  let lifeLength = "75";


  countryName = convertIsoToCountry(iso);
  localHello = getLocalHello(iso);

  countryInfo = countryToInformation(countryName);
  currency = countryToCurrency(countryName);
  nationalDish = countryNationalDish(countryName);
  lifeLength = countryLifeExpectancy(countryName);

  // let p1 = localHello + " from " + countryName + " \n If you don't know where it is it's " + countryInfo + "\nHope all is well \nI spend " + currency + " all the time!";
  // let p2 = localHello + " from the land of " + countryName + "!  A pigeon alighted upon my finger this evening and tied to its foot was a small bundle of " + currency + "!  What a world is " + countryInfo + "! - " + currentProfile.name;
  // let p3 = "Three words, and then silence.  A poet is only as good as the " + currency + " in his pocket.  Luckily, " + countryName + " has welcomed me with open arms and the " + countryInfo + " is a place to behold.  "+ localHello + " ever Yours, " + currentProfile.name;
  // let p4 = localHello + " my friend! Through these many days of wandering, " + countryName + " has proved a gem. XOXO, "+ currentProfile.name;
  // let p5 = localHello + " from an old fool!  In " + countryName + " I have found my greatest love.  I have forgone " + currency + " and am finally, unequicicably me: " + currentProfile.name;

  //let p6 = "hello: " + localHello + " / countryName: " + countryName + " / countryInfo: " + countryInfo.region + " / " +  countryInfo.name + " / " + countryInfo.dem + " / currency: " + currency + " / nationalDish: " + nationalDish + " / life length: " + lifeLength;
  let p6 = localHello + " from " + countryInfo.name + ". I decided to leave everything behind and I now see myself surrounded by " + countryInfo.dem + "s . It has taken me some time to get used to this place, the " + nationalDish + " that " + countryInfo.dem + "s seem to love is not really my thing. Also it costs a lot of " + currency + ".";
  let p7 = localHello + " from a world traveller. I am living the dream. I exchanged all the money on your account into " + currency + " so I can gamble, drink and eat. The traditional dish here is " + nationalDish + " and it’s great. Well, I just wanted to send you an update from " + countryInfo.region + ". Will send you a postcard next time I need more money. Cheers from " + countryInfo.name;
  let p8 = "Woooow. I randomly flew to " + countryInfo.region + " and ended up in " + countryName + ". Look at the picture, I am surrounded by " + countryInfo.dem + " s . They taught me the word "  + localHello + " -- their way of saying hello. I’m staying here for a while. The average life length is " + lifeLength + " probably because they eat a lot of " + nationalDish + ". Sayonara. XOXO, " + currentProfile.name;

  let p9 = "Yesterday, I learned to cook " + nationalDish + " from a chef here in " + countryName + ".  Boy was it hard!  So many ingredients! Love always, " + currentProfile.name;
  let p10 = localHello +  " I just got out the airplane and screamed, \'I am finally in "+ countryName + "!!!\' when someone in a top hat corrected me, saying \'please, my dear, when in " + countryInfo.region + " we do not say " + countryName + ", rather we call it " + countryInfo.name  + ".\' Mind your P’s and Q’s!\' Rough start. Now I am off for some " + nationalDish + ". LOL.";
  let p11 = "Wowzers.  Narrowly escaped death in " + countryName + "!  Just kidding!  Actually am having a blast easting " + nationalDish + ".  Sorry for the joke..." + currentProfile.name;
  let p12 = "Am thinking of opening a restaurant selling " + nationalDish + "!  Come on down to " + countryName + " and help me!  I need a sous chef and also a lot of " + currency + ".  Sound good? " + currentProfile.name;
  let p13 = "Have only been in " + countryName + " a few days and am already feeling like this is home.  All my best, " + currentProfile.name;
  let p14 = "Greetings and salutations.  Had some trouble at the border, but am feeling so glad to be in " + countryInfo.region + " once again.  My travels have taught me patience.  Wish I could see you, " + currentProfile.name;
  let p15 = countryInfo.name + " has taught me to love again.  With love, " + currentProfile.name;
  let p16 = "Check it out!  This photo is the view from my tent.  You only see that in " + countryInfo.region;
  let p17 = "The " + countryInfo.dem + " play a game called " + countryName + " Ball.  I don't understand the rules but it is sooooo fun.  I lost a lot of money so please send " + currency;
  let p18 = "The " + countryInfo.dems + " are very tall people! And strong too! Did you know the average lifespan here is " + lifeLength;
  let p19 = "I just got hustled.  :(  I paid 500,000 " + currency + " for a cab ride.  I also don't know where I am.  Please send a map. All good though!!" ;
  let p20 = "Hey!  Where am I?  Can you call me on this pay phone? I am out of " + currency + ".  The number is +347889 223 893 2772 9299.  Don't worry about me!!";



  let postcardTemplates = [p6,p7,p8,p9,p10, p11,p12,p13,p14,p15,p16,p17,p18,p19,p20];
  let postcardText = postcardTemplates[floor(random(postcardTemplates.length))];
  console.log(postcardText);
  return postcardText;
  // return p10;
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
}


function closePostcard(){
  let pc = select('#postcard');
  if (pc != null){ pc.remove();}
}
